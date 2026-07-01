import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const config = window.HIVE_ADMIN_CONFIG;

if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
  throw new Error('Falta configurar Supabase para el panel admin.');
}

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const state = {
  adminEmail: '',
  currentFilter: 'pending',
  docUrls: {
    front: '',
    serial: '',
    avatar: '',
  },
  queue: [],
  search: '',
  selectedSubmissionId: null,
  session: null,
};

const els = {
  actionFeedback: document.getElementById('action-feedback'),
  adminEmail: document.getElementById('admin-email'),
  appView: document.getElementById('app-view'),
  approveButton: document.getElementById('approve-button'),
  approvedCount: document.getElementById('approved-count'),
  detailAvatar: document.getElementById('detail-avatar'),
  detailBirthDate: document.getElementById('detail-birth-date'),
  detailCard: document.getElementById('detail-card'),
  detailEmail: document.getElementById('detail-email'),
  detailEmpty: document.getElementById('detail-empty'),
  detailName: document.getElementById('detail-name'),
  detailPhone: document.getElementById('detail-phone'),
  detailRut: document.getElementById('detail-rut'),
  detailStatus: document.getElementById('detail-status'),
  detailSubmissionName: document.getElementById('detail-submission-name'),
  detailSubmittedAt: document.getElementById('detail-submitted-at'),
  emailInput: document.getElementById('email-input'),
  frontDocImage: document.getElementById('front-doc-image'),
  loginButton: document.getElementById('login-button'),
  loginError: document.getElementById('login-error'),
  loginForm: document.getElementById('login-form'),
  loginView: document.getElementById('login-view'),
  logoutButton: document.getElementById('logout-button'),
  passwordInput: document.getElementById('password-input'),
  pendingCount: document.getElementById('pending-count'),
  queueEmpty: document.getElementById('queue-empty'),
  queueList: document.getElementById('queue-list'),
  refreshDocsButton: document.getElementById('refresh-docs-button'),
  rejectedCount: document.getElementById('rejected-count'),
  rejectButton: document.getElementById('reject-button'),
  reviewerNotes: document.getElementById('reviewer-notes'),
  searchInput: document.getElementById('search-input'),
  serialDocImage: document.getElementById('serial-doc-image'),
  totalCount: document.getElementById('total-count'),
};

function setView(isLoggedIn) {
  els.loginView.classList.toggle('active', !isLoggedIn);
  els.appView.classList.toggle('active', isLoggedIn);
}

function formatDate(dateString) {
  if (!dateString) return 'Sin dato';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

function formatBirthDate(dateString) {
  if (!dateString) return 'Sin dato';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
  }).format(new Date(`${dateString}T00:00:00`));
}

function statusLabel(status) {
  return {
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
    unsubmitted: 'Sin enviar',
  }[status] ?? status;
}

function statusClass(status) {
  return `status-badge status-${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'}`;
}

function getErrorMessage(error, fallback) {
  if (typeof error === 'string' && error.trim()) return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return fallback;
}

function setFeedback(message, tone = 'success') {
  els.actionFeedback.textContent = message;
  els.actionFeedback.className = `action-feedback ${tone}`;
  els.actionFeedback.classList.remove('hidden');
}

function clearFeedback() {
  els.actionFeedback.className = 'action-feedback hidden';
  els.actionFeedback.textContent = '';
}

async function ensureAdmin(session) {
  const { data, error } = await supabase.rpc('is_admin_user', {
    p_user_id: session.user.id,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function fetchQueue() {
  const { data, error } = await supabase.rpc('list_verification_queue', {
    p_search: state.search || null,
    p_status: null,
  });

  if (error) {
    throw error;
  }

  state.queue = Array.isArray(data) ? data : [];
}

function computeCounts() {
  const counts = {
    approved: 0,
    pending: 0,
    rejected: 0,
    total: state.queue.length,
  };

  state.queue.forEach((item) => {
    if (item.status in counts) {
      counts[item.status] += 1;
    }
  });

  els.pendingCount.textContent = String(counts.pending);
  els.approvedCount.textContent = String(counts.approved);
  els.rejectedCount.textContent = String(counts.rejected);
  els.totalCount.textContent = String(counts.total);
}

function getFilteredQueue() {
  if (state.currentFilter === 'all') {
    return state.queue;
  }

  return state.queue.filter((item) => item.status === state.currentFilter);
}

function renderQueue() {
  const filtered = getFilteredQueue();
  els.queueList.innerHTML = '';
  els.queueEmpty.classList.toggle('hidden', filtered.length > 0);

  filtered.forEach((item) => {
    const card = document.createElement('article');
    card.className = item.submission_id === state.selectedSubmissionId ? 'selected' : '';
    card.innerHTML = `
      <div class="queue-head">
        <div>
          <p class="${statusClass(item.status)}">${statusLabel(item.status)}</p>
          <h3>${item.submission_full_name || item.profile_full_name || 'Sin nombre'}</h3>
          <p class="queue-card-copy">${item.email || 'Sin correo'}</p>
        </div>
        <div class="identity-block">
          <span class="mini-label">RUT</span>
          <strong>${item.rut}</strong>
        </div>
      </div>
      <div class="queue-meta">
        <span class="muted">Enviado ${formatDate(item.submitted_at)}</span>
        <span class="muted">${item.reviewed_at ? `Revisado ${formatDate(item.reviewed_at)}` : 'Sin revisión'}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      state.selectedSubmissionId = item.submission_id;
      clearFeedback();
      renderQueue();
      renderDetail();
    });
    els.queueList.appendChild(card);
  });
}

async function getSignedUrl(path) {
  if (!path) return '';
  const { data, error } = await supabase.storage.from('verification-docs').createSignedUrl(path, 60 * 20);
  if (error) {
    throw error;
  }
  return data?.signedUrl ?? '';
}

async function refreshDocumentUrls() {
  const selected = state.queue.find((item) => item.submission_id === state.selectedSubmissionId);
  if (!selected) return;

  const [front, serial, avatar] = await Promise.all([
    getSignedUrl(selected.front_document_path),
    getSignedUrl(selected.serial_document_path),
    selected.avatar_url ? getSignedUrl(selected.avatar_url) : Promise.resolve(''),
  ]);

  state.docUrls = { front, serial, avatar };
}

function renderDetail() {
  const selected = state.queue.find((item) => item.submission_id === state.selectedSubmissionId);

  els.detailEmpty.classList.toggle('hidden', Boolean(selected));
  els.detailCard.classList.toggle('hidden', !selected);

  if (!selected) {
    return;
  }

  els.detailStatus.className = statusClass(selected.status);
  els.detailStatus.textContent = statusLabel(selected.status);
  els.detailName.textContent = selected.profile_full_name || selected.submission_full_name || 'Sin nombre';
  els.detailEmail.textContent = selected.email || 'Sin correo';
  els.detailRut.textContent = selected.rut || 'Sin RUT';
  els.detailSubmissionName.textContent = selected.submission_full_name || 'Sin dato';
  els.detailPhone.textContent = selected.phone_number || 'Sin dato';
  els.detailBirthDate.textContent = formatBirthDate(selected.birth_date);
  els.detailSubmittedAt.textContent = formatDate(selected.submitted_at);
  els.reviewerNotes.value = selected.reviewer_notes || '';

  els.detailAvatar.src = state.docUrls.avatar || 'https://placehold.co/640x700/f4e8e7/8d6f78?text=Selfie';
  els.frontDocImage.src = state.docUrls.front || 'https://placehold.co/960x760/f4e8e7/8d6f78?text=Documento';
  els.serialDocImage.src = state.docUrls.serial || 'https://placehold.co/960x760/f4e8e7/8d6f78?text=Serial';

  const reviewable = selected.status === 'pending';
  els.approveButton.disabled = !reviewable;
  els.rejectButton.disabled = !reviewable;
}

async function hydrateSelectedDocuments() {
  if (!state.selectedSubmissionId) {
    const first = getFilteredQueue()[0];
    state.selectedSubmissionId = first?.submission_id ?? null;
  }

  if (!state.selectedSubmissionId) {
    renderDetail();
    return;
  }

  try {
    await refreshDocumentUrls();
  } catch (error) {
    setFeedback(getErrorMessage(error, 'No fue posible generar enlaces seguros para los documentos.'), 'error');
  }

  renderDetail();
}

async function reloadDashboard() {
  await fetchQueue();
  computeCounts();
  renderQueue();
  await hydrateSelectedDocuments();
}

async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

async function handleSession(session) {
  state.session = session;

  if (!session?.user) {
    state.adminEmail = '';
    state.queue = [];
    state.selectedSubmissionId = null;
    state.docUrls = { front: '', serial: '', avatar: '' };
    els.adminEmail.textContent = '';
    setView(false);
    return;
  }

  const allowed = await ensureAdmin(session);
  if (!allowed) {
    await supabase.auth.signOut();
    throw new Error('La cuenta autenticada no existe en public.admin_users.');
  }

  state.adminEmail = session.user.email ?? session.user.id;
  els.adminEmail.textContent = state.adminEmail;
  setView(true);
  await reloadDashboard();
}

async function reviewSubmission(decision) {
  const selected = state.queue.find((item) => item.submission_id === state.selectedSubmissionId);
  if (!selected) {
    return;
  }

  clearFeedback();
  els.approveButton.disabled = true;
  els.rejectButton.disabled = true;

  try {
    const { data, error } = await supabase.functions.invoke(config.reviewFunctionName, {
      body: {
        decision,
        reviewerNotes: els.reviewerNotes.value.trim(),
        submissionId: selected.submission_id,
      },
    });

    if (error) {
      let detailedMessage = error.message;

      try {
        if ('context' in error && error.context instanceof Response) {
          const responseBody = await error.context.clone().json();
          detailedMessage = responseBody?.error || responseBody?.message || detailedMessage;
        }
      } catch {
        // Keep the original message when the response body is not JSON.
      }

      throw new Error(detailedMessage);
    }

    await reloadDashboard();

    if (data?.emailSent === false) {
      setFeedback(
        `Estado actualizado a ${statusLabel(decision).toLowerCase()}, pero el correo no se pudo enviar${data?.emailError ? `: ${data.emailError}` : '.'}`,
        'warning',
      );
      return;
    }

    setFeedback(`Solicitud ${statusLabel(decision).toLowerCase()} y correo enviado.`, 'success');
  } catch (error) {
    setFeedback(getErrorMessage(error, 'No fue posible registrar la decisión.'), 'error');
    renderDetail();
  } finally {
    const selectedAfter = state.queue.find((item) => item.submission_id === state.selectedSubmissionId);
    const reviewable = selectedAfter?.status === 'pending';
    els.approveButton.disabled = !reviewable;
    els.rejectButton.disabled = !reviewable;
  }
}

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.loginError.classList.add('hidden');
  els.loginButton.disabled = true;

  try {
    await login(els.emailInput.value.trim().toLowerCase(), els.passwordInput.value);
  } catch (error) {
    els.loginError.textContent = getErrorMessage(error, 'No fue posible iniciar sesión.');
    els.loginError.classList.remove('hidden');
  } finally {
    els.loginButton.disabled = false;
  }
});

els.logoutButton.addEventListener('click', async () => {
  await supabase.auth.signOut();
});

els.searchInput.addEventListener('input', async (event) => {
  state.search = event.target.value.trim();
  await reloadDashboard();
});

document.querySelectorAll('#status-filters .chip').forEach((chip) => {
  chip.addEventListener('click', async () => {
    document.querySelectorAll('#status-filters .chip').forEach((node) => node.classList.remove('active'));
    chip.classList.add('active');
    state.currentFilter = chip.dataset.filter;
    renderQueue();
    await hydrateSelectedDocuments();
  });
});

els.approveButton.addEventListener('click', async () => reviewSubmission('approved'));
els.rejectButton.addEventListener('click', async () => reviewSubmission('rejected'));
els.refreshDocsButton.addEventListener('click', async () => {
  await hydrateSelectedDocuments();
});

supabase.auth.onAuthStateChange((_event, session) => {
  handleSession(session).catch((error) => {
    els.loginError.textContent = getErrorMessage(error, 'No fue posible validar la sesión admin.');
    els.loginError.classList.remove('hidden');
    setView(false);
  });
});

const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  await handleSession(session).catch((error) => {
    els.loginError.textContent = getErrorMessage(error, 'No fue posible cargar la sesión actual.');
    els.loginError.classList.remove('hidden');
    setView(false);
  });
} else {
  setView(false);
}
