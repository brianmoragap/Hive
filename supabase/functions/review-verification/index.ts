import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

type Decision = 'approved' | 'rejected';

interface ReviewRequest {
  submissionId?: string;
  decision?: Decision;
  reviewerNotes?: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function buildEmailHtml({
  decision,
  fullName,
  reviewerNotes,
}: {
  decision: Decision;
  fullName: string;
  reviewerNotes: string;
}) {
  const approved = decision === 'approved';
  const title = approved ? 'Tu cuenta Hive fue aprobada' : 'Tu validacion de identidad fue rechazada';
  const body = approved
    ? 'Tu cuenta ya quedo verificada. Desde ahora puedes entrar a eventos, crear salidas y participar en la comunidad Hive.'
    : 'Revisamos tu informacion y necesitamos que vuelvas a enviarla. Ingresa a la app, corrige los datos y sube la documentacion nuevamente.';
  const notesBlock = reviewerNotes
    ? `<p style="margin:16px 0 0;color:#7b5a63;"><strong>Nota del equipo:</strong> ${reviewerNotes}</p>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;background:#f7efee;padding:32px;color:#41242e;">
      <div style="max-width:620px;margin:0 auto;background:#fff8f6;border-radius:24px;padding:32px;border:1px solid rgba(144,80,93,0.08);">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#c9364d;">Hive</p>
        <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;">${title}</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hola ${fullName || 'deportista'},</p>
        <p style="margin:0;font-size:16px;line-height:1.7;">${body}</p>
        ${notesBlock}
        <div style="margin-top:28px;padding:18px 20px;border-radius:18px;background:${approved ? 'rgba(28,140,107,0.08)' : 'rgba(179,47,68,0.08)'};">
          <p style="margin:0;font-size:14px;line-height:1.7;color:#6f535c;">
            Estado actual: <strong>${approved ? 'Aprobada' : 'Rechazada'}</strong>
          </p>
        </div>
      </div>
    </div>
  `;
}

async function sendReviewEmail({
  decision,
  email,
  fullName,
  reviewerNotes,
}: {
  decision: Decision;
  email: string;
  fullName: string;
  reviewerNotes: string;
}) {
  if (!email) {
    return {
      emailError: 'La usuaria no tiene correo en su perfil.',
      emailSent: false,
    };
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('HIVE_REVIEW_FROM_EMAIL');

  if (!resendKey || !fromEmail) {
    return {
      emailError: 'Faltan RESEND_API_KEY o HIVE_REVIEW_FROM_EMAIL en los secrets de la function.',
      emailSent: false,
    };
  }

  const approved = decision === 'approved';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      html: buildEmailHtml({ decision, fullName, reviewerNotes }),
      subject: approved ? 'Hive: tu cuenta fue aprobada' : 'Hive: vuelve a enviar tu validacion',
      to: [email],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      emailError: `Resend devolvio ${response.status}: ${text}`,
      emailSent: false,
    };
  }

  return {
    emailError: null,
    emailSent: true,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabasePublishableKey =
    Deno.env.get('SB_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!authResponse.ok) {
    const authBody = await authResponse.text();
    return jsonResponse({ error: authBody || 'Invalid user session' }, 401);
  }

  const authUser = (await authResponse.json()) as { id?: string };
  const userId = authUser.id ?? null;

  if (!userId) {
    return jsonResponse({ error: 'Invalid user session' }, 401);
  }
  const { data: adminRow, error: adminError } = await adminClient
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', userId)
    .maybeSingle();

  if (adminError) {
    return jsonResponse({ error: adminError.message }, 500);
  }

  if (!adminRow) {
    return jsonResponse({ error: 'Current user is not allowed to review identities.' }, 403);
  }

  const body = (await request.json()) as ReviewRequest;
  const submissionId = body.submissionId?.trim();
  const decision = body.decision;
  const reviewerNotes = body.reviewerNotes?.trim() ?? '';

  if (!submissionId || (decision !== 'approved' && decision !== 'rejected')) {
    return jsonResponse({ error: 'Invalid review payload.' }, 400);
  }

  const { data: submission, error: submissionError } = await adminClient
    .from('verification_submissions')
    .select('id, user_id, full_name, rut, status')
    .eq('id', submissionId)
    .maybeSingle();

  if (submissionError) {
    return jsonResponse({ error: submissionError.message }, 500);
  }

  if (!submission) {
    return jsonResponse({ error: 'Verification submission not found.' }, 404);
  }

  if (submission.status !== 'pending') {
    return jsonResponse({ error: 'This submission has already been reviewed.' }, 409);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', submission.user_id)
    .maybeSingle();

  if (profileError || !profile) {
    return jsonResponse({ error: profileError?.message ?? 'Profile not found.' }, 500);
  }

  const reviewedAt = new Date().toISOString();
  const verifiedAt = decision === 'approved' ? reviewedAt : null;

  const { error: submissionUpdateError } = await adminClient
    .from('verification_submissions')
    .update({
      reviewer_id: userId,
      reviewer_notes: reviewerNotes || null,
      reviewed_at: reviewedAt,
      status: decision,
    })
    .eq('id', submission.id);

  if (submissionUpdateError) {
    return jsonResponse({ error: submissionUpdateError.message }, 500);
  }

  const { error: profileUpdateError } = await adminClient
    .from('profiles')
    .update({
      is_verified: decision === 'approved',
      verification_status: decision,
      verified_at: verifiedAt,
    })
    .eq('id', submission.user_id);

  if (profileUpdateError) {
    return jsonResponse({ error: profileUpdateError.message }, 500);
  }

  const notificationPayload =
    decision === 'approved'
      ? {
          body: 'Tu identidad fue aprobada. Ya puedes usar eventos, grupos y comunidad Hive.',
          title: 'Cuenta verificada',
          type: 'verification_approved',
        }
      : {
          body: reviewerNotes
            ? `Tu identidad fue rechazada. Motivo: ${reviewerNotes}`
            : 'Tu identidad fue rechazada. Revisa la app y vuelve a enviar la documentacion.',
          title: 'Validacion rechazada',
          type: 'verification_rejected',
        };

  const { error: notificationError } = await adminClient.from('notifications').insert({
    body: notificationPayload.body,
    metadata: {
      decision,
      submission_id: submission.id,
    },
    title: notificationPayload.title,
    type: notificationPayload.type,
    user_id: submission.user_id,
  });

  if (notificationError) {
    return jsonResponse({ error: notificationError.message }, 500);
  }

  const { error: auditError } = await adminClient.from('verification_review_logs').insert({
    decision,
    reviewer_id: userId,
    reviewer_notes: reviewerNotes || null,
    submission_id: submission.id,
    user_id: submission.user_id,
  });

  if (auditError) {
    return jsonResponse({ error: auditError.message }, 500);
  }

  const emailResult = await sendReviewEmail({
    decision,
    email: profile.email ?? '',
    fullName: submission.full_name || profile.full_name || 'deportista',
    reviewerNotes,
  });

  return jsonResponse({
    decision,
    emailError: emailResult.emailError,
    emailSent: emailResult.emailSent,
    reviewedAt,
    submissionId: submission.id,
  });
});
