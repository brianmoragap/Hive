import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { hasSupabaseConfig, supabase } from '../lib/supabase';
import {
  buildNotificationInsert,
  buildStartsAt,
  hydrateRemoteEvents,
  mapMemberDirectoryRow,
  mapNotificationRow,
  type MemberDirectoryRow,
  type SupabaseAttendancePassRow,
  type SupabaseEventActivityLogRow,
  type SupabaseEventParticipantRow,
  type SupabaseEventReviewRow,
  type SupabaseEventRow,
  type SupabaseNotificationRow,
} from '../lib/supabaseEvents';
import { useSession } from './SessionProvider';
import type {
  EventAttendancePass,
  EventDraftPayload,
  EventRecord,
  EventReview,
  HiveMember,
  NotificationDigest,
  RatingStats,
  UserProfile,
} from '../types/domain';
import {
  normalizeManualPassCode,
  parseEventPassPayload,
} from '../utils/eventPasses';
import { buildRatingStats } from '../utils/events';

const STORAGE_PREFIX = '@hive/events';
const NOTIFICATIONS_PREFIX = '@hive/event-notifications';
type BackendMode = 'local' | 'remote';

interface EventMutationResult {
  attendeeCount: number;
  event: EventRecord;
}

interface InviteMembersResult extends EventMutationResult {
  addedCount: number;
}

interface JoinEventResult {
  event: EventRecord;
  status: 'already_joined' | 'cancelled' | 'completed' | 'full' | 'host' | 'joined';
}

interface LeaveEventResult {
  event: EventRecord;
  status: 'completed' | 'left' | 'host' | 'not_joined';
}

interface SubmitEventReviewPayload {
  eventRating: number;
  organizerRating: number;
}

interface SubmitEventReviewResult {
  event: EventRecord;
  review?: EventReview;
  status: 'already_reviewed' | 'not_allowed' | 'submitted';
}

interface ScanAttendanceResult {
  attendeeId?: string;
  event?: EventRecord;
  status:
    | 'already_checked_in'
    | 'cancelled'
    | 'checked_in'
    | 'event_mismatch'
    | 'invalid'
    | 'not_found'
    | 'not_host';
}

interface EventsContextValue {
  events: EventRecord[];
  hiveMembers: HiveMember[];
  joinedEvents: EventRecord[];
  myEvents: EventRecord[];
  notifications: NotificationDigest[];
  unreadNotifications: number;
  buildShareLink: (event: EventRecord) => string;
  cancelEvent: (eventId: string) => Promise<EventMutationResult>;
  completeEvent: (eventId: string) => Promise<EventMutationResult>;
  createEvent: (payload: EventDraftPayload) => Promise<EventRecord>;
  getAttendancePass: (eventId: string, userId?: string) => EventAttendancePass | null;
  getEventById: (eventId: string) => EventRecord | null;
  getEventByShareToken: (shareToken: string) => EventRecord | null;
  getEventReviewByUser: (eventId: string, userId?: string) => EventReview | null;
  getEventReviewStats: (eventId: string) => RatingStats;
  getOrganizerReviewStats: (organizerId: string) => RatingStats;
  inviteMembers: (eventId: string, memberIds: string[]) => Promise<InviteMembersResult>;
  joinEvent: (eventId: string) => Promise<JoinEventResult>;
  leaveEvent: (eventId: string) => Promise<LeaveEventResult>;
  markAllNotificationsRead: () => void;
  scanAttendanceCode: (eventId: string, rawCode: string) => Promise<ScanAttendanceResult>;
  submitEventReview: (
    eventId: string,
    payload: SubmitEventReviewPayload,
  ) => Promise<SubmitEventReviewResult>;
  visibleEvents: EventRecord[];
  updateEvent: (
    eventId: string,
    payload: EventDraftPayload,
  ) => Promise<EventMutationResult>;
}

const EventsContext = createContext<EventsContextValue | null>(null);

const seedMembers: HiveMember[] = [
  {
    id: 'member-elena',
    fullName: 'Elena Soto',
    handle: '@elena.soto',
    city: 'Providencia',
    favoriteSport: 'mtb',
    isVerified: true,
    avatarUrl: null,
  },
  {
    id: 'member-paula',
    fullName: 'Paula Reyes',
    handle: '@paula.reyes',
    city: 'Vitacura',
    favoriteSport: 'running',
    isVerified: true,
    avatarUrl: null,
  },
  {
    id: 'member-sofia',
    fullName: 'Sofía Mella',
    handle: '@sofia.mella',
    city: 'La Reina',
    favoriteSport: 'trail_running',
    isVerified: true,
    avatarUrl: null,
  },
  {
    id: 'member-catalina',
    fullName: 'Catalina Díaz',
    handle: '@cata.diaz',
    city: 'Ñuñoa',
    favoriteSport: 'road_cycling',
    isVerified: true,
    avatarUrl: null,
  },
  {
    id: 'member-manuela',
    fullName: 'Manuela Araya',
    handle: '@manuela.araya',
    city: 'Lo Barnechea',
    favoriteSport: 'trekking',
    isVerified: true,
    avatarUrl: null,
  },
];

function buildSeedEvents() {
  const seedNow = new Date('2026-04-05T09:00:00.000Z').toISOString();

  return [
    {
      id: 'seed-running-retiro',
      title: 'Amanecer en el Retiro · Running 5K',
      sport: 'running' as const,
      skillLevel: 'beginner' as const,
      date: '12/04/2026',
      time: '07:30',
      meetingPoint: 'Parque Bicentenario, Vitacura',
      participantLimit: 8,
      visibility: 'public' as const,
      creatorId: 'member-paula',
      creatorName: 'Paula Reyes',
      attendeeIds: ['member-elena', 'member-catalina'],
      attendancePasses: [],
      reviews: [],
      shareToken: 'seed-running-retiro',
      status: 'scheduled' as const,
      completedAt: null,
      cancellationReason: null,
      activityLog: [
        {
          id: 'seed-log-running-retiro',
          type: 'created' as const,
          createdAt: seedNow,
          audienceCount: 0,
        },
      ],
      createdAt: seedNow,
      updatedAt: seedNow,
    },
    {
      id: 'seed-mtb-san-cristobal',
      title: 'MTB San Cristóbal · Subida técnica',
      sport: 'mtb' as const,
      skillLevel: 'intermediate' as const,
      date: '13/04/2026',
      time: '18:30',
      meetingPoint: 'Pedro de Valdivia Norte',
      participantLimit: 10,
      visibility: 'public' as const,
      creatorId: 'member-elena',
      creatorName: 'Elena Soto',
      attendeeIds: ['member-sofia'],
      attendancePasses: [],
      reviews: [],
      shareToken: 'seed-mtb-san-cristobal',
      status: 'scheduled' as const,
      completedAt: null,
      cancellationReason: null,
      activityLog: [
        {
          id: 'seed-log-mtb-san-cristobal',
          type: 'created' as const,
          createdAt: seedNow,
          audienceCount: 0,
        },
      ],
      createdAt: seedNow,
      updatedAt: seedNow,
    },
    {
      id: 'seed-road-costanera',
      title: 'Costanera coral · Ruta 45K',
      sport: 'road_cycling' as const,
      skillLevel: 'advanced' as const,
      date: '19/04/2026',
      time: '08:00',
      meetingPoint: 'Plaza San Enrique',
      participantLimit: 14,
      visibility: 'public' as const,
      creatorId: 'member-catalina',
      creatorName: 'Catalina Díaz',
      attendeeIds: ['member-paula', 'member-manuela'],
      attendancePasses: [],
      reviews: [],
      shareToken: 'seed-road-costanera',
      status: 'scheduled' as const,
      completedAt: null,
      cancellationReason: null,
      activityLog: [
        {
          id: 'seed-log-road-costanera',
          type: 'created' as const,
          createdAt: seedNow,
          audienceCount: 0,
        },
      ],
      createdAt: seedNow,
      updatedAt: seedNow,
    },
    {
      id: 'seed-trekking-yerba',
      title: 'Trekking Yerba Loca · Paso seguro',
      sport: 'trekking' as const,
      skillLevel: 'beginner' as const,
      date: '20/04/2026',
      time: '09:00',
      meetingPoint: 'Centro de visitantes Yerba Loca',
      participantLimit: 12,
      visibility: 'public' as const,
      creatorId: 'member-manuela',
      creatorName: 'Manuela Araya',
      attendeeIds: ['member-elena'],
      attendancePasses: [],
      reviews: [],
      shareToken: 'seed-trekking-yerba',
      status: 'scheduled' as const,
      completedAt: null,
      cancellationReason: null,
      activityLog: [
        {
          id: 'seed-log-trekking-yerba',
          type: 'created' as const,
          createdAt: seedNow,
          audienceCount: 0,
        },
      ],
      createdAt: seedNow,
      updatedAt: seedNow,
    },
    {
      id: 'seed-trail-manquehue',
      title: 'Trail Manquehue · Fondo progresivo',
      sport: 'trail_running' as const,
      skillLevel: 'intermediate' as const,
      date: '26/04/2026',
      time: '08:30',
      meetingPoint: 'Parque Aguas de Ramón',
      participantLimit: 9,
      visibility: 'public' as const,
      creatorId: 'member-sofia',
      creatorName: 'Sofía Mella',
      attendeeIds: [],
      attendancePasses: [],
      reviews: [],
      shareToken: 'seed-trail-manquehue',
      status: 'scheduled' as const,
      completedAt: null,
      cancellationReason: null,
      activityLog: [
        {
          id: 'seed-log-trail-manquehue',
          type: 'created' as const,
          createdAt: seedNow,
          audienceCount: 0,
        },
      ],
      createdAt: seedNow,
      updatedAt: seedNow,
    },
  ] satisfies EventRecord[];
}

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createManualCode(existingCodes?: Set<string>) {
  let nextCode = '';

  do {
    nextCode = Math.floor(100000 + Math.random() * 900000).toString();
  } while (existingCodes?.has(nextCode));

  return nextCode;
}

function createAttendancePass(
  userId: string,
  issuedAt: string,
  existingCodes?: Set<string>,
): EventAttendancePass {
  const manualCode = createManualCode(existingCodes);
  existingCodes?.add(manualCode);

  return {
    id: createLocalId('pass'),
    userId,
    token: createLocalId('token'),
    manualCode,
    issuedAt,
    revokedAt: null,
    checkedInAt: null,
    checkedInBy: null,
  };
}

function clampRating(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function normalizeAttendancePasses(event: EventRecord) {
  const attendeeIds = Array.from(new Set(event.attendeeIds));
  const rawPasses = Array.isArray(event.attendancePasses) ? event.attendancePasses : [];
  const usedCodes = new Set<string>();
  const nextPasses: EventAttendancePass[] = [];

  rawPasses.forEach((pass) => {
    if (!pass || typeof pass.userId !== 'string') {
      return;
    }

    const manualCode = normalizeManualPassCode(
      typeof pass.manualCode === 'string' && pass.manualCode.trim().length > 0
        ? pass.manualCode
        : createManualCode(usedCodes),
    );

    usedCodes.add(manualCode);

    nextPasses.push({
      id: typeof pass.id === 'string' ? pass.id : createLocalId('pass'),
      userId: pass.userId,
      token: typeof pass.token === 'string' ? pass.token : createLocalId('token'),
      manualCode,
      issuedAt: typeof pass.issuedAt === 'string' ? pass.issuedAt : event.createdAt,
      revokedAt: typeof pass.revokedAt === 'string' ? pass.revokedAt : null,
      checkedInAt: typeof pass.checkedInAt === 'string' ? pass.checkedInAt : null,
      checkedInBy: typeof pass.checkedInBy === 'string' ? pass.checkedInBy : null,
    });
  });

  attendeeIds.forEach((attendeeId) => {
    const hasActivePass = nextPasses.some((pass) => pass.userId === attendeeId && !pass.revokedAt);

    if (!hasActivePass) {
      nextPasses.push(createAttendancePass(attendeeId, event.updatedAt || event.createdAt, usedCodes));
    }
  });

  return {
    ...event,
    attendeeIds,
    completedAt: typeof event.completedAt === 'string' ? event.completedAt : null,
    reviews: Array.isArray(event.reviews)
      ? event.reviews
          .filter(
            (review) =>
              review &&
              typeof review.reviewerId === 'string' &&
              typeof review.eventRating === 'number' &&
              typeof review.organizerRating === 'number',
          )
          .map((review) => ({
            id: typeof review.id === 'string' ? review.id : createLocalId('review'),
            reviewerId: review.reviewerId,
            reviewerName:
              typeof review.reviewerName === 'string' && review.reviewerName.trim().length > 0
                ? review.reviewerName
                : 'Hive Member',
            eventRating: clampRating(review.eventRating),
            organizerRating: clampRating(review.organizerRating),
            createdAt:
              typeof review.createdAt === 'string' ? review.createdAt : event.updatedAt,
          }))
      : [],
    attendancePasses: nextPasses,
  };
}

function getActiveAttendancePass(event: EventRecord, userId: string) {
  return event.attendancePasses.find((pass) => pass.userId === userId && !pass.revokedAt) ?? null;
}

function getEventsKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function getNotificationsKey(userId: string) {
  return `${NOTIFICATIONS_PREFIX}:${userId}`;
}

function deriveDisplayName(email: string) {
  const base = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'Hive';
  return base.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildCurrentMember(profile: UserProfile | null, email: string, userId: string): HiveMember {
  const fullName = profile?.fullName?.trim() || deriveDisplayName(email);
  const handleBase = fullName.toLowerCase().replace(/[^a-z0-9]+/gi, '.').replace(/^\.+|\.+$/g, '');

  return {
    id: userId,
    fullName,
    handle: `@${handleBase || 'hive.member'}`,
    city: 'Santiago',
    favoriteSport: profile?.favoriteSports?.[0] ?? 'running',
    isVerified: profile?.isVerified ?? false,
    avatarUrl: profile?.avatarUrl ?? null,
  };
}

function createNotification(
  action: NotificationDigest['action'],
  event: EventRecord,
  audienceCount: number,
): NotificationDigest {
  return {
    id: createLocalId('notification'),
    action,
    eventId: event.id,
    eventTitle: event.title,
    audienceCount,
    createdAt: new Date().toISOString(),
    read: false,
    perspective: 'organizer',
  };
}

function buildShareLink(event: EventRecord) {
  return `hive://join/${event.shareToken}`;
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const { profile, user } = useSession();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationDigest[]>([]);
  const [memberDirectory, setMemberDirectory] = useState<HiveMember[]>(seedMembers);
  const [backendMode, setBackendMode] = useState<BackendMode>(
    hasSupabaseConfig && supabase ? 'remote' : 'local',
  );

  const localHiveMembers = useMemo(() => {
    if (!user) {
      return seedMembers;
    }

    const currentMember = buildCurrentMember(profile, user.email, user.id);
    const uniqueMembers = seedMembers.filter((member) => member.id !== currentMember.id);

    return [currentMember, ...uniqueMembers];
  }, [profile, user]);

  const hiveMembers = useMemo(() => {
    if (backendMode !== 'remote') {
      return localHiveMembers;
    }

    if (!user) {
      return memberDirectory;
    }

    const currentMember = buildCurrentMember(profile, user.email, user.id);
    const uniqueMembers = memberDirectory.filter((member) => member.id !== currentMember.id);

    return [currentMember, ...uniqueMembers];
  }, [backendMode, localHiveMembers, memberDirectory, profile, user]);

  const applyRemoteSnapshot = useCallback(
    (snapshot: {
      events: EventRecord[];
      members: HiveMember[];
      notifications: NotificationDigest[];
    }) => {
      setEvents(snapshot.events);
      setNotifications(snapshot.notifications);
      setMemberDirectory(snapshot.members);
      setBackendMode('remote');
    },
    [],
  );

  const loadRemoteSnapshot = useCallback(async () => {
    if (!supabase || !user) {
      throw new Error('Supabase no está disponible para eventos.');
    }

    const [
      memberResult,
      eventResult,
      participantResult,
      passResult,
      reviewResult,
      activityResult,
      notificationResult,
    ] = await Promise.all([
      supabase.rpc('list_hive_members'),
      supabase
        .from('events')
        .select(
          'id, title, sport, skill_level, starts_at, location_name, meeting_point, organizer_id, visibility, status, share_slug, max_participants, completed_at, cancellation_reason, created_at, updated_at',
        )
        .order('updated_at', { ascending: false }),
      supabase
        .from('event_participants')
        .select('id, event_id, user_id, status, joined_at')
        .order('joined_at', { ascending: false }),
      supabase
        .from('event_attendance_passes')
        .select('id, event_id, user_id, pass_token, manual_code, issued_at, revoked_at, checked_in_at, checked_in_by'),
      supabase
        .from('event_reviews')
        .select('id, event_id, reviewer_id, reviewer_name, event_rating, organizer_rating, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('event_activity_logs')
        .select('id, event_id, activity_type, audience_count, note, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('id, type, title, body, metadata, read_at, created_at')
        .order('created_at', { ascending: false })
        .limit(40),
    ]);

    const firstError =
      memberResult.error ||
      eventResult.error ||
      participantResult.error ||
      passResult.error ||
      reviewResult.error ||
      activityResult.error ||
      notificationResult.error;

    if (firstError) {
      throw firstError;
    }

    const currentMember = buildCurrentMember(profile, user.email, user.id);
    const members = ((memberResult.data ?? []) as MemberDirectoryRow[]).map((row: MemberDirectoryRow) =>
      mapMemberDirectoryRow(row),
    );
    const mergedMembers = members.some((member: HiveMember) => member.id === currentMember.id)
      ? members
      : [currentMember, ...members];

    return {
      events: hydrateRemoteEvents({
        activityRows: (activityResult.data ?? []) as SupabaseEventActivityLogRow[],
        eventRows: (eventResult.data ?? []) as SupabaseEventRow[],
        memberRows: mergedMembers,
        passRows: (passResult.data ?? []) as SupabaseAttendancePassRow[],
        participantRows: (participantResult.data ?? []) as SupabaseEventParticipantRow[],
        reviewRows: (reviewResult.data ?? []) as SupabaseEventReviewRow[],
      }).map((event) => normalizeAttendancePasses(event)),
      members: mergedMembers,
      notifications: (notificationResult.data ?? [])
        .map((row) => mapNotificationRow(row as SupabaseNotificationRow))
        .filter((row): row is NotificationDigest => Boolean(row)),
    };
  }, [profile, user]);

  const refreshRemoteSnapshot = useCallback(async () => {
    const snapshot = await loadRemoteSnapshot();
    applyRemoteSnapshot(snapshot);
    return snapshot;
  }, [applyRemoteSnapshot, loadRemoteSnapshot]);

  const pushRemoteNotification = useCallback(
    async (action: NotificationDigest['action'], event: EventRecord, audienceCount: number) => {
      if (!supabase || !user || audienceCount <= 0) {
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert(buildNotificationInsert(action, event, audienceCount, user.id, 'organizer'));

      if (error) {
        console.warn('Hive remote notification insert failed.', error);
      }
    },
    [user],
  );

  const pushAttendeeNotifications = useCallback(
    async (action: NotificationDigest['action'], event: EventRecord, audienceUserIds: string[]) => {
      if (!supabase || !user) {
        return;
      }

      const recipients = Array.from(new Set(audienceUserIds)).filter(
        (recipientId) => recipientId !== user.id,
      );

      if (recipients.length === 0) {
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert(
          recipients.map((recipientId) =>
            buildNotificationInsert(action, event, recipients.length, recipientId, 'attendee'),
          ),
        );

      if (error) {
        console.warn('Hive remote attendee notification insert failed.', error);
      }
    },
    [user],
  );

  useEffect(() => {
    let active = true;

    async function loadLocalState() {
      if (!user) {
        if (!active) {
          return;
        }

        setEvents([]);
        setNotifications([]);
        setMemberDirectory(seedMembers);
        setBackendMode('local');
        return;
      }

      const [storedEvents, storedNotifications] = await Promise.all([
        AsyncStorage.getItem(getEventsKey(user.id)),
        AsyncStorage.getItem(getNotificationsKey(user.id)),
      ]);

      if (!active) {
        return;
      }

      const seedEvents = buildSeedEvents();
      const parsedStoredEvents = storedEvents ? (JSON.parse(storedEvents) as EventRecord[]) : [];
      const mergedEvents = [
        ...parsedStoredEvents,
        ...seedEvents.filter(
          (seedEvent) => !parsedStoredEvents.some((storedEvent) => storedEvent.id === seedEvent.id),
        ),
      ]
        .map((event) => normalizeAttendancePasses(event))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

      setEvents(mergedEvents);
      setNotifications(
        storedNotifications ? (JSON.parse(storedNotifications) as NotificationDigest[]) : [],
      );
      setMemberDirectory(localHiveMembers);
      setBackendMode('local');

      if (!storedEvents || mergedEvents.length !== parsedStoredEvents.length) {
        await AsyncStorage.setItem(getEventsKey(user.id), JSON.stringify(mergedEvents));
      }
    }

    async function loadState() {
      if (hasSupabaseConfig && supabase && user) {
        try {
          const snapshot = await loadRemoteSnapshot();

          if (!active) {
            return;
          }

          applyRemoteSnapshot(snapshot);
          return;
        } catch (error) {
          console.warn('Hive remote events bootstrap failed.', error);
        }
      }

      await loadLocalState();
    }

    void loadState();

    return () => {
      active = false;
    };
  }, [applyRemoteSnapshot, loadRemoteSnapshot, localHiveMembers, user?.id]);

  useEffect(() => {
    if (!user || backendMode !== 'local') {
      return;
    }

    void AsyncStorage.setItem(getEventsKey(user.id), JSON.stringify(events));
  }, [backendMode, events, user?.id]);

  useEffect(() => {
    if (!user || backendMode !== 'local') {
      return;
    }

    void AsyncStorage.setItem(getNotificationsKey(user.id), JSON.stringify(notifications));
  }, [backendMode, notifications, user?.id]);

  const pushNotification = (action: NotificationDigest['action'], event: EventRecord, audienceCount: number) => {
    if (audienceCount <= 0) {
      return;
    }

    setNotifications((current) => [createNotification(action, event, audienceCount), ...current].slice(0, 40));
  };

  const createEvent = async (payload: EventDraftPayload) => {
    if (!user) {
      throw new Error('No hay una sesión activa.');
    }

    if (backendMode === 'remote' && supabase) {
      const startsAt = buildStartsAt(payload.date, payload.time);
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: payload.title,
          description: payload.title,
          sport: payload.sport,
          skill_level: payload.skillLevel,
          starts_at: startsAt,
          location_name: payload.meetingPoint,
          meeting_point: payload.meetingPoint,
          organizer_id: user.id,
          visibility: payload.visibility,
          status: 'scheduled',
          max_participants: payload.participantLimit,
        })
        .select(
          'id, title, sport, skill_level, starts_at, location_name, meeting_point, organizer_id, visibility, status, share_slug, max_participants, completed_at, cancellation_reason, created_at, updated_at',
        )
        .single();

      if (error || !data) {
        throw error ?? new Error('No pudimos crear el evento en Supabase.');
      }

      const nextEvent = normalizeAttendancePasses(
        hydrateRemoteEvents({
          activityRows: [],
          eventRows: [data as SupabaseEventRow],
          memberRows: hiveMembers,
          passRows: [],
          participantRows: [],
          reviewRows: [],
        })[0],
      );

      const { error: logError } = await supabase.from('event_activity_logs').insert({
        event_id: data.id,
        activity_type: 'created',
        audience_count: 0,
      });

      if (logError) {
        console.warn('Hive remote create log failed.', logError);
      }

      const snapshot = await refreshRemoteSnapshot();
      return snapshot.events.find((event) => event.id === data.id) ?? nextEvent;
    }

    const now = new Date().toISOString();
    const creatorName = buildCurrentMember(profile, user.email, user.id).fullName;
    const nextEvent: EventRecord = {
      ...payload,
      id: createLocalId('event'),
      creatorId: user.id,
      creatorName,
      attendeeIds: [],
      attendancePasses: [],
      reviews: [],
      shareToken: createLocalId('share'),
      status: 'scheduled',
      completedAt: null,
      cancellationReason: null,
      activityLog: [
        {
          id: createLocalId('event-log'),
          type: 'created',
          createdAt: now,
          audienceCount: 0,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    setEvents((current) => [nextEvent, ...current]);
    return nextEvent;
  };

  const updateEvent = async (eventId: string, payload: EventDraftPayload) => {
    if (backendMode === 'remote' && supabase) {
      const targetEvent = events.find((event) => event.id === eventId);

      if (!targetEvent) {
        throw new Error('No encontramos el evento.');
      }

      const startsAt = buildStartsAt(payload.date, payload.time);
      const { error } = await supabase
        .from('events')
        .update({
          title: payload.title,
          description: payload.title,
          sport: payload.sport,
          skill_level: payload.skillLevel,
          starts_at: startsAt,
          location_name: payload.meetingPoint,
          meeting_point: payload.meetingPoint,
          visibility: payload.visibility,
          max_participants: payload.participantLimit,
        })
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      const { error: logError } = await supabase.from('event_activity_logs').insert({
        event_id: eventId,
        activity_type: 'updated',
        audience_count: targetEvent.attendeeIds.length,
      });

      if (logError) {
        console.warn('Hive remote update log failed.', logError);
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId);

      if (!nextEvent) {
        throw new Error('No encontramos el evento.');
      }

      await pushRemoteNotification('updated', nextEvent, targetEvent.attendeeIds.length);
      await pushAttendeeNotifications('updated', nextEvent, targetEvent.attendeeIds);

      return {
        attendeeCount: nextEvent.attendeeIds.length,
        event: nextEvent,
      };
    }

    let result: EventMutationResult | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const nextEvent: EventRecord = {
          ...event,
          ...payload,
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: createLocalId('event-log'),
              type: 'updated',
              createdAt: new Date().toISOString(),
              audienceCount: event.attendeeIds.length,
            },
            ...event.activityLog,
          ],
        };

        result = {
          attendeeCount: event.attendeeIds.length,
          event: nextEvent,
        };

        return nextEvent;
      }),
    );

    if (!result) {
      throw new Error('No encontramos el evento.');
    }

    const resolvedResult = result as EventMutationResult;
    pushNotification('updated', resolvedResult.event, resolvedResult.attendeeCount);
    return resolvedResult;
  };

  const cancelEvent = async (eventId: string) => {
    if (backendMode === 'remote' && supabase) {
      const targetEvent = events.find((event) => event.id === eventId);

      if (!targetEvent) {
        throw new Error('No encontramos el evento.');
      }

      const { error } = await supabase
        .from('events')
        .update({
          status: 'cancelled',
          cancellation_reason: 'cancelled_by_host',
        })
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      const { error: logError } = await supabase.from('event_activity_logs').insert({
        event_id: eventId,
        activity_type: 'cancelled',
        audience_count: targetEvent.attendeeIds.length,
      });

      if (logError) {
        console.warn('Hive remote cancel log failed.', logError);
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId);

      if (!nextEvent) {
        throw new Error('No encontramos el evento.');
      }

      await pushRemoteNotification('cancelled', nextEvent, targetEvent.attendeeIds.length);
      await pushAttendeeNotifications('cancelled', nextEvent, targetEvent.attendeeIds);

      return {
        attendeeCount: nextEvent.attendeeIds.length,
        event: nextEvent,
      };
    }

    let result: EventMutationResult | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const nextEvent: EventRecord = {
          ...event,
          status: 'cancelled',
          cancellationReason: 'cancelled_by_host',
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: createLocalId('event-log'),
              type: 'cancelled',
              createdAt: new Date().toISOString(),
              audienceCount: event.attendeeIds.length,
            },
            ...event.activityLog,
          ],
        };

        result = {
          attendeeCount: event.attendeeIds.length,
          event: nextEvent,
        };

        return nextEvent;
      }),
    );

    if (!result) {
      throw new Error('No encontramos el evento.');
    }

    const resolvedResult = result as EventMutationResult;
    pushNotification('cancelled', resolvedResult.event, resolvedResult.attendeeCount);
    return resolvedResult;
  };

  const completeEvent = async (eventId: string) => {
    if (backendMode === 'remote' && supabase) {
      const targetEvent = events.find((event) => event.id === eventId);

      if (!targetEvent) {
        throw new Error('No encontramos el evento.');
      }

      const completedAt = new Date().toISOString();
      const { error } = await supabase
        .from('events')
        .update({
          status: 'completed',
          completed_at: completedAt,
        })
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      const { error: logError } = await supabase.from('event_activity_logs').insert({
        event_id: eventId,
        activity_type: 'completed',
        audience_count: targetEvent.attendeeIds.length,
      });

      if (logError) {
        console.warn('Hive remote complete log failed.', logError);
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId);

      if (!nextEvent) {
        throw new Error('No encontramos el evento.');
      }

      await pushRemoteNotification('completed', nextEvent, targetEvent.attendeeIds.length);
      await pushAttendeeNotifications('completed', nextEvent, targetEvent.attendeeIds);

      return {
        attendeeCount: nextEvent.attendeeIds.length,
        event: nextEvent,
      };
    }

    let result: EventMutationResult | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const completedAt = new Date().toISOString();
        const nextEvent: EventRecord = {
          ...event,
          status: 'completed',
          completedAt,
          updatedAt: completedAt,
          activityLog: [
            {
              id: createLocalId('event-log'),
              type: 'completed',
              createdAt: completedAt,
              audienceCount: event.attendeeIds.length,
            },
            ...event.activityLog,
          ],
        };

        result = {
          attendeeCount: event.attendeeIds.length,
          event: nextEvent,
        };

        return nextEvent;
      }),
    );

    if (!result) {
      throw new Error('No encontramos el evento.');
    }

    const resolvedResult = result as EventMutationResult;
    pushNotification('completed', resolvedResult.event, resolvedResult.attendeeCount);
    return resolvedResult;
  };

  const inviteMembers = async (eventId: string, memberIds: string[]) => {
    if (backendMode === 'remote' && supabase) {
      const targetEvent = events.find((event) => event.id === eventId);

      if (!targetEvent || !user) {
        throw new Error('No encontramos el evento.');
      }

      const uniqueMemberIds = Array.from(new Set(memberIds)).filter(
        (memberId) => memberId !== targetEvent.creatorId && !targetEvent.attendeeIds.includes(memberId),
      );
      const remainingSpots = Math.max(
        targetEvent.participantLimit - 1 - targetEvent.attendeeIds.length,
        0,
      );
      const acceptedInvites = uniqueMemberIds.slice(0, remainingSpots);

      if (acceptedInvites.length > 0) {
        const issuedAt = new Date().toISOString();
        const usedCodes = new Set(targetEvent.attendancePasses.map((pass) => pass.manualCode));

        const { error: participantError } = await supabase.from('event_participants').upsert(
          acceptedInvites.map((memberId) => ({
            event_id: eventId,
            user_id: memberId,
            status: 'joined',
            joined_at: issuedAt,
          })),
          { onConflict: 'event_id,user_id' },
        );

        if (participantError) {
          throw participantError;
        }

        const { error: passError } = await supabase.from('event_attendance_passes').upsert(
          acceptedInvites.map((memberId) => {
            const pass = createAttendancePass(memberId, issuedAt, usedCodes);

            return {
              event_id: eventId,
              user_id: memberId,
              pass_token: pass.token,
              manual_code: pass.manualCode,
              issued_at: pass.issuedAt,
              revoked_at: null,
              checked_in_at: null,
              checked_in_by: null,
            };
          }),
          { onConflict: 'event_id,user_id' },
        );

        if (passError) {
          throw passError;
        }

        const { error: inviteError } = await supabase.from('event_invites').insert(
          acceptedInvites.map((memberId) => ({
            event_id: eventId,
            invited_user_id: memberId,
            invite_channel: 'directory',
            created_by: user.id,
            status: 'accepted',
          })),
        );

        if (inviteError) {
          console.warn('Hive remote invite rows failed.', inviteError);
        }

        const { error: logError } = await supabase.from('event_activity_logs').insert({
          event_id: eventId,
          activity_type: 'invited',
          audience_count: acceptedInvites.length,
        });

        if (logError) {
          console.warn('Hive remote invite log failed.', logError);
        }
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId);

      if (!nextEvent) {
        throw new Error('No encontramos el evento.');
      }

      await pushRemoteNotification('invited', nextEvent, acceptedInvites.length);
      await pushAttendeeNotifications('invited', nextEvent, acceptedInvites);

      return {
        addedCount: acceptedInvites.length,
        attendeeCount: nextEvent.attendeeIds.length,
        event: nextEvent,
      };
    }

    let result: InviteMembersResult | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const uniqueMemberIds = Array.from(new Set(memberIds)).filter(
          (memberId) => memberId !== event.creatorId && !event.attendeeIds.includes(memberId),
        );
        const remainingSpots = Math.max(event.participantLimit - 1 - event.attendeeIds.length, 0);
        const acceptedInvites = uniqueMemberIds.slice(0, remainingSpots);
        const nextAttendeeIds = [...event.attendeeIds, ...acceptedInvites];
        const usedCodes = new Set(event.attendancePasses.map((pass) => pass.manualCode));
        const nextEvent: EventRecord = {
          ...event,
          attendeeIds: nextAttendeeIds,
          attendancePasses: [
            ...event.attendancePasses,
            ...acceptedInvites.map((memberId) =>
              createAttendancePass(memberId, new Date().toISOString(), usedCodes),
            ),
          ],
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: createLocalId('event-log'),
              type: 'invited',
              createdAt: new Date().toISOString(),
              audienceCount: acceptedInvites.length,
            },
            ...event.activityLog,
          ],
        };

        result = {
          addedCount: acceptedInvites.length,
          attendeeCount: nextAttendeeIds.length,
          event: nextEvent,
        };

        return nextEvent;
      }),
    );

    if (!result) {
      throw new Error('No encontramos el evento.');
    }

    const resolvedResult = result as InviteMembersResult;
    pushNotification('invited', resolvedResult.event, resolvedResult.addedCount);
    return resolvedResult;
  };

  const joinEvent = async (eventId: string) => {
    if (!user) {
      throw new Error('No hay una sesión activa.');
    }

    const targetEvent = events.find((event) => event.id === eventId);

    if (!targetEvent) {
      throw new Error('No encontramos el evento.');
    }

    if (targetEvent.creatorId === user.id) {
      return {
        event: targetEvent,
        status: 'host' as const,
      };
    }

    if (targetEvent.status === 'cancelled') {
      return {
        event: targetEvent,
        status: 'cancelled' as const,
      };
    }

    if (targetEvent.status === 'completed') {
      return {
        event: targetEvent,
        status: 'completed' as const,
      };
    }

    if (targetEvent.attendeeIds.includes(user.id)) {
      return {
        event: targetEvent,
        status: 'already_joined' as const,
      };
    }

    const usedSpots = targetEvent.attendeeIds.length + 1;

    if (usedSpots >= targetEvent.participantLimit) {
      return {
        event: targetEvent,
        status: 'full' as const,
      };
    }

    if (backendMode === 'remote' && supabase) {
      const issuedAt = new Date().toISOString();
      const usedCodes = new Set(targetEvent.attendancePasses.map((pass) => pass.manualCode));
      const nextPass = createAttendancePass(user.id, issuedAt, usedCodes);

      const { error: participantError } = await supabase.from('event_participants').upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status: 'joined',
          joined_at: issuedAt,
        },
        { onConflict: 'event_id,user_id' },
      );

      if (participantError) {
        throw participantError;
      }

      const { error: passError } = await supabase.from('event_attendance_passes').upsert(
        {
          event_id: eventId,
          user_id: user.id,
          pass_token: nextPass.token,
          manual_code: nextPass.manualCode,
          issued_at: nextPass.issuedAt,
          revoked_at: null,
          checked_in_at: null,
          checked_in_by: null,
        },
        { onConflict: 'event_id,user_id' },
      );

      if (passError) {
        throw passError;
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId) ?? targetEvent;

      return {
        event: nextEvent,
        status: 'joined' as const,
      };
    }

    let result: EventRecord | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const issuedAt = new Date().toISOString();
        const usedCodes = new Set(event.attendancePasses.map((pass) => pass.manualCode));
        const nextEvent: EventRecord = {
          ...event,
          attendeeIds: [...event.attendeeIds, user.id],
          attendancePasses: [
            ...event.attendancePasses,
            createAttendancePass(user.id, issuedAt, usedCodes),
          ],
          updatedAt: new Date().toISOString(),
        };

        result = nextEvent;
        return nextEvent;
      }),
    );

    return {
      event: result ?? targetEvent,
      status: 'joined' as const,
    };
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) {
      throw new Error('No hay una sesión activa.');
    }

    const targetEvent = events.find((event) => event.id === eventId);

    if (!targetEvent) {
      throw new Error('No encontramos el evento.');
    }

    if (targetEvent.creatorId === user.id) {
      return {
        event: targetEvent,
        status: 'host' as const,
      };
    }

    if (targetEvent.status === 'completed') {
      return {
        event: targetEvent,
        status: 'completed' as const,
      };
    }

    if (!targetEvent.attendeeIds.includes(user.id)) {
      return {
        event: targetEvent,
        status: 'not_joined' as const,
      };
    }

    if (backendMode === 'remote' && supabase) {
      const revokedAt = new Date().toISOString();

      const { error: participantError } = await supabase
        .from('event_participants')
        .update({
          status: 'removed',
          updated_at: revokedAt,
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (participantError) {
        throw participantError;
      }

      const { error: passError } = await supabase
        .from('event_attendance_passes')
        .update({
          revoked_at: revokedAt,
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .is('revoked_at', null);

      if (passError) {
        throw passError;
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId) ?? targetEvent;

      return {
        event: nextEvent,
        status: 'left' as const,
      };
    }

    let result: EventRecord | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const revokedAt = new Date().toISOString();
        const nextEvent: EventRecord = {
          ...event,
          attendeeIds: event.attendeeIds.filter((attendeeId) => attendeeId !== user.id),
          attendancePasses: event.attendancePasses.map((pass) =>
            pass.userId === user.id && !pass.revokedAt
              ? {
                  ...pass,
                  revokedAt,
                }
              : pass,
          ),
          updatedAt: revokedAt,
        };

        result = nextEvent;
        return nextEvent;
      }),
    );

    return {
      event: result ?? targetEvent,
      status: 'left' as const,
    };
  };

  const getAttendancePass = (eventId: string, userId?: string) => {
    const resolvedUserId = userId ?? user?.id;

    if (!resolvedUserId) {
      return null;
    }

    const event = events.find((item) => item.id === eventId);

    if (!event) {
      return null;
    }

    return getActiveAttendancePass(event, resolvedUserId);
  };

  const getEventReviewByUser = (eventId: string, userId?: string) => {
    const resolvedUserId = userId ?? user?.id;

    if (!resolvedUserId) {
      return null;
    }

    const event = events.find((item) => item.id === eventId);

    if (!event) {
      return null;
    }

    return event.reviews.find((review) => review.reviewerId === resolvedUserId) ?? null;
  };

  const getEventReviewStats = (eventId: string) => {
    const event = events.find((item) => item.id === eventId);

    if (!event) {
      return {
        average: 0,
        count: 0,
      };
    }

    return buildRatingStats(event.reviews.map((review) => review.eventRating));
  };

  const getOrganizerReviewStats = (organizerId: string) => {
    const organizerReviews = events
      .filter((event) => event.creatorId === organizerId)
      .flatMap((event) => event.reviews.map((review) => review.organizerRating));

    return buildRatingStats(organizerReviews);
  };

  const submitEventReview = async (
    eventId: string,
    payload: SubmitEventReviewPayload,
  ) => {
    if (!user) {
      throw new Error('No hay una sesión activa.');
    }

    const targetEvent = events.find((event) => event.id === eventId);

    if (!targetEvent) {
      throw new Error('No encontramos el evento.');
    }

    const isAllowedReviewer =
      targetEvent.status === 'completed' &&
      targetEvent.creatorId !== user.id &&
      targetEvent.attendeeIds.includes(user.id);

    if (!isAllowedReviewer) {
      return {
        event: targetEvent,
        status: 'not_allowed' as const,
      };
    }

    const existingReview =
      targetEvent.reviews.find((review) => review.reviewerId === user.id) ?? null;

    if (existingReview) {
      return {
        event: targetEvent,
        review: existingReview,
        status: 'already_reviewed' as const,
      };
    }

    if (backendMode === 'remote' && supabase) {
      const reviewInsert = {
        event_id: eventId,
        reviewer_id: user.id,
        reviewer_name: buildCurrentMember(profile, user.email, user.id).fullName,
        event_rating: clampRating(payload.eventRating),
        organizer_rating: clampRating(payload.organizerRating),
      };

      const { error } = await supabase.from('event_reviews').insert(reviewInsert);

      if (error) {
        if (error.code === '23505') {
          const snapshot = await refreshRemoteSnapshot();
          const nextEvent = snapshot.events.find((event) => event.id === eventId) ?? targetEvent;
          const nextReview =
            nextEvent.reviews.find((review) => review.reviewerId === user.id) ?? undefined;

          return {
            event: nextEvent,
            review: nextReview,
            status: 'already_reviewed' as const,
          };
        }

        throw error;
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId) ?? targetEvent;
      const nextReview = nextEvent.reviews.find((review) => review.reviewerId === user.id);

      return {
        event: nextEvent,
        review: nextReview,
        status: 'submitted' as const,
      };
    }

    const review: EventReview = {
      id: createLocalId('review'),
      reviewerId: user.id,
      reviewerName: buildCurrentMember(profile, user.email, user.id).fullName,
      eventRating: clampRating(payload.eventRating),
      organizerRating: clampRating(payload.organizerRating),
      createdAt: new Date().toISOString(),
    };

    let result: EventRecord | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const nextEvent: EventRecord = {
          ...event,
          reviews: [review, ...event.reviews],
          updatedAt: review.createdAt,
        };

        result = nextEvent;
        return nextEvent;
      }),
    );

    return {
      event: result ?? targetEvent,
      review,
      status: 'submitted' as const,
    };
  };

  const scanAttendanceCode = async (eventId: string, rawCode: string) => {
    if (!user) {
      throw new Error('No hay una sesión activa.');
    }

    const targetEvent = events.find((event) => event.id === eventId);

    if (!targetEvent) {
      return {
        status: 'not_found' as const,
      };
    }

    if (targetEvent.creatorId !== user.id) {
      return {
        event: targetEvent,
        status: 'not_host' as const,
      };
    }

    if (targetEvent.status === 'cancelled') {
      return {
        event: targetEvent,
        status: 'cancelled' as const,
      };
    }

    const parsedPayload = parseEventPassPayload(rawCode);

    if (parsedPayload && parsedPayload.eventId !== eventId) {
      return {
        event: targetEvent,
        status: 'event_mismatch' as const,
      };
    }

    const matchedPass = parsedPayload
      ? targetEvent.attendancePasses.find(
          (pass) =>
            pass.userId === parsedPayload.userId &&
            pass.token === parsedPayload.token &&
            !pass.revokedAt,
        ) ?? null
      : targetEvent.attendancePasses.find(
          (pass) =>
            pass.manualCode === normalizeManualPassCode(rawCode) &&
            !pass.revokedAt,
        ) ?? null;

    if (!matchedPass || !targetEvent.attendeeIds.includes(matchedPass.userId)) {
      return {
        event: targetEvent,
        status: 'invalid' as const,
      };
    }

    if (matchedPass.checkedInAt) {
      return {
        attendeeId: matchedPass.userId,
        event: targetEvent,
        status: 'already_checked_in' as const,
      };
    }

    if (backendMode === 'remote' && supabase) {
      const checkedInAt = new Date().toISOString();
      const { error } = await supabase
        .from('event_attendance_passes')
        .update({
          checked_in_at: checkedInAt,
          checked_in_by: user.id,
        })
        .eq('id', matchedPass.id);

      if (error) {
        throw error;
      }

      const snapshot = await refreshRemoteSnapshot();
      const nextEvent = snapshot.events.find((event) => event.id === eventId) ?? targetEvent;

      return {
        attendeeId: matchedPass.userId,
        event: nextEvent,
        status: 'checked_in' as const,
      };
    }

    const checkedInAt = new Date().toISOString();
    let result: EventRecord | null = null;

    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const nextEvent: EventRecord = {
          ...event,
          attendancePasses: event.attendancePasses.map((pass) =>
            pass.id === matchedPass.id
              ? {
                  ...pass,
                  checkedInAt,
                  checkedInBy: user.id,
                }
              : pass,
          ),
          updatedAt: checkedInAt,
        };

        result = nextEvent;
        return nextEvent;
      }),
    );

    return {
      attendeeId: matchedPass.userId,
      event: result ?? targetEvent,
      status: 'checked_in' as const,
    };
  };

  const markAllNotificationsRead = () => {
    if (backendMode === 'remote' && supabase && user) {
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      void supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)
        .then(({ error }) => {
          if (error) {
            console.warn('Hive remote notifications read failed.', error);
          }
        });
      return;
    }

    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const myEvents = useMemo(() => {
    if (!user) {
      return [];
    }

    return [...events]
      .filter((event) => event.creatorId === user.id)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [events, user]);

  const joinedEvents = useMemo(() => {
    if (!user) {
      return [];
    }

    return [...events]
      .filter((event) => event.creatorId === user.id || event.attendeeIds.includes(user.id))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [events, user]);

  const visibleEvents = useMemo(() => {
    if (!user) {
      return [];
    }

    return [...events]
      .filter((event) => {
        if (event.visibility === 'public') {
          return true;
        }

        return event.creatorId === user.id || event.attendeeIds.includes(user.id);
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [events, user]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const getEventById = (eventId: string) => events.find((event) => event.id === eventId) ?? null;

  const getEventByShareToken = (shareToken: string) =>
    events.find((event) => event.shareToken === shareToken) ?? null;

  const value = {
    events,
    hiveMembers,
    joinedEvents,
    myEvents,
    notifications,
    unreadNotifications,
    buildShareLink,
    cancelEvent,
    completeEvent,
    createEvent,
    getAttendancePass,
    getEventById,
    getEventByShareToken,
    getEventReviewByUser,
    getEventReviewStats,
    getOrganizerReviewStats,
    inviteMembers,
    joinEvent,
    leaveEvent,
    markAllNotificationsRead,
    scanAttendanceCode,
    submitEventReview,
    visibleEvents,
    updateEvent,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('useEvents debe usarse dentro de EventsProvider.');
  }

  return context;
}
