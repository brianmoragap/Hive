import type {
  EventActivityLog,
  EventActivityType,
  EventAttendancePass,
  EventRecord,
  EventReview,
  EventStatus,
  EventVisibility,
  HiveMember,
  NotificationDigest,
  SkillLevel,
  SportType,
} from '../types/domain';

type JsonRecord = Record<string, unknown>;

export interface MemberDirectoryRow {
  avatar_url: string | null;
  city: string | null;
  email?: string | null;
  favorite_sport: SportType | null;
  full_name: string | null;
  handle: string | null;
  id: string;
  is_verified: boolean | null;
}

export interface SupabaseEventRow {
  cancellation_reason: string | null;
  completed_at: string | null;
  created_at: string;
  id: string;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  max_participants: number | null;
  meeting_point: string | null;
  organizer_id: string;
  share_slug: string;
  skill_level: SkillLevel;
  sport: SportType;
  starts_at: string;
  status: EventStatus;
  title: string;
  updated_at: string;
  visibility: EventVisibility;
}

export interface SupabaseEventParticipantRow {
  event_id: string;
  id: string;
  joined_at: string;
  status: string;
  user_id: string;
}

export interface SupabaseAttendancePassRow {
  checked_in_at: string | null;
  checked_in_by: string | null;
  event_id: string;
  id: string;
  issued_at: string;
  manual_code: string;
  pass_token: string;
  revoked_at: string | null;
  user_id: string;
}

export interface SupabaseEventReviewRow {
  created_at: string;
  event_id: string;
  event_rating: number;
  id: string;
  organizer_rating: number;
  reviewer_id: string;
  reviewer_name: string;
}

export interface SupabaseEventActivityLogRow {
  activity_type: EventActivityType;
  audience_count: number;
  created_at: string;
  event_id: string;
  id: string;
  note: string | null;
}

export interface SupabaseNotificationRow {
  body: string;
  created_at: string;
  id: string;
  metadata: JsonRecord | null;
  read_at: string | null;
  title: string;
  type: string;
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

function deriveDisplayName(seed: string) {
  return seed
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function deriveHandle(seed: string) {
  const base = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return `@${base || 'hive.member'}`;
}

function coerceFavoriteSport(value: SportType | null | undefined) {
  return value ?? 'running';
}

export function mapMemberDirectoryRow(row: MemberDirectoryRow): HiveMember {
  const fallbackSeed = row.full_name?.trim() || row.email?.split('@')[0] || 'Hive Member';
  const fullName = row.full_name?.trim() || deriveDisplayName(fallbackSeed);

  return {
    id: row.id,
    fullName,
    handle: row.handle?.trim() || deriveHandle(fullName),
    city: row.city?.trim() || 'Santiago',
    favoriteSport: coerceFavoriteSport(row.favorite_sport),
    isVerified: Boolean(row.is_verified),
    avatarUrl: row.avatar_url ?? null,
  };
}

export function buildStartsAt(date: string, time: string) {
  const [day, month, year] = date.split('/').map((value) => Number(value));
  const [hours, minutes] = time.split(':').map((value) => Number(value));

  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

export function splitStartsAt(startsAt: string) {
  const date = new Date(startsAt);

  return {
    date: `${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`,
    time: `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`,
  };
}

function mapAttendancePassRow(row: SupabaseAttendancePassRow): EventAttendancePass {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.pass_token,
    manualCode: row.manual_code,
    issuedAt: row.issued_at,
    revokedAt: row.revoked_at,
    checkedInAt: row.checked_in_at,
    checkedInBy: row.checked_in_by,
  };
}

function mapReviewRow(row: SupabaseEventReviewRow): EventReview {
  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    eventRating: row.event_rating,
    organizerRating: row.organizer_rating,
    createdAt: row.created_at,
  };
}

function mapActivityRow(row: SupabaseEventActivityLogRow): EventActivityLog {
  return {
    id: row.id,
    type: row.activity_type,
    createdAt: row.created_at,
    audienceCount: row.audience_count,
    note: row.note,
  };
}

export function hydrateRemoteEvents(input: {
  activityRows: SupabaseEventActivityLogRow[];
  eventRows: SupabaseEventRow[];
  memberRows: HiveMember[];
  passRows: SupabaseAttendancePassRow[];
  participantRows: SupabaseEventParticipantRow[];
  reviewRows: SupabaseEventReviewRow[];
}): EventRecord[] {
  const memberMap = new Map(input.memberRows.map((member) => [member.id, member]));
  const participantsByEvent = new Map<string, SupabaseEventParticipantRow[]>();
  const passesByEvent = new Map<string, SupabaseAttendancePassRow[]>();
  const reviewsByEvent = new Map<string, SupabaseEventReviewRow[]>();
  const activityByEvent = new Map<string, SupabaseEventActivityLogRow[]>();

  input.participantRows.forEach((row) => {
    const current = participantsByEvent.get(row.event_id) ?? [];
    current.push(row);
    participantsByEvent.set(row.event_id, current);
  });

  input.passRows.forEach((row) => {
    const current = passesByEvent.get(row.event_id) ?? [];
    current.push(row);
    passesByEvent.set(row.event_id, current);
  });

  input.reviewRows.forEach((row) => {
    const current = reviewsByEvent.get(row.event_id) ?? [];
    current.push(row);
    reviewsByEvent.set(row.event_id, current);
  });

  input.activityRows.forEach((row) => {
    const current = activityByEvent.get(row.event_id) ?? [];
    current.push(row);
    activityByEvent.set(row.event_id, current);
  });

  return input.eventRows
    .map((row) => {
      const schedule = splitStartsAt(row.starts_at);
      const participants = (participantsByEvent.get(row.id) ?? []).filter(
        (participant) => participant.status === 'joined',
      );
      const creator = memberMap.get(row.organizer_id);

      return {
        id: row.id,
        title: row.title,
        sport: row.sport,
        skillLevel: row.skill_level,
        date: schedule.date,
        time: schedule.time,
        meetingPoint: row.meeting_point?.trim() || row.location_name?.trim() || '',
        lat: row.lat ?? null,
        lng: row.lng ?? null,
        participantLimit: row.max_participants ?? 12,
        visibility: row.visibility,
        creatorId: row.organizer_id,
        creatorName: creator?.fullName ?? 'Hive Member',
        attendeeIds: participants.map((participant) => participant.user_id),
        attendancePasses: (passesByEvent.get(row.id) ?? []).map(mapAttendancePassRow),
        reviews: (reviewsByEvent.get(row.id) ?? []).map(mapReviewRow),
        shareToken: row.share_slug,
        status: row.status,
        completedAt: row.completed_at,
        cancellationReason: row.cancellation_reason,
        activityLog: (activityByEvent.get(row.id) ?? [])
          .map(mapActivityRow)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } satisfies EventRecord;
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function mapNotificationRow(row: SupabaseNotificationRow): NotificationDigest | null {
  if (row.type === 'verification_approved' || row.type === 'verification_rejected') {
    return {
      id: row.id,
      action: row.type,
      eventId: '',
      eventTitle: row.body,
      audienceCount: 0,
      createdAt: row.created_at,
      read: Boolean(row.read_at),
      perspective: 'attendee',
    };
  }

  const action = (() => {
    if (typeof row.metadata?.action === 'string') {
      return row.metadata.action;
    }

    if (row.type === 'updated' || row.type === 'invited' || row.type === 'completed' || row.type === 'cancelled') {
      return row.type;
    }

    return null;
  })();

  if (
    action !== 'updated' &&
    action !== 'invited' &&
    action !== 'completed' &&
    action !== 'cancelled'
  ) {
    return null;
  }

  return {
    id: row.id,
    action,
    eventId:
      typeof row.metadata?.event_id === 'string'
        ? row.metadata.event_id
        : '',
    eventTitle:
      typeof row.metadata?.event_title === 'string'
        ? row.metadata.event_title
        : row.title,
    audienceCount:
      typeof row.metadata?.audience_count === 'number'
        ? row.metadata.audience_count
        : 0,
    createdAt: row.created_at,
    read: Boolean(row.read_at),
    perspective: row.metadata?.recipient === 'attendee' ? 'attendee' : 'organizer',
  };
}

export function buildNotificationInsert(
  action: NotificationDigest['action'],
  event: Pick<EventRecord, 'id' | 'title'>,
  audienceCount: number,
  userId: string,
  recipient: 'organizer' | 'attendee' = 'organizer',
) {
  return {
    user_id: userId,
    event_id: event.id,
    type: action,
    title: event.title,
    body: `${action}:${event.title}`,
    metadata: {
      action,
      audience_count: audienceCount,
      event_id: event.id,
      event_title: event.title,
      recipient,
    },
  };
}
