import type { AppCopy } from '../i18n/copy';
import type {
  EventActivityLog,
  EventRecord,
  NotificationDigest,
  RatingStats,
} from '../types/domain';

export function formatEventSchedule(event: Pick<EventRecord, 'date' | 'time'>) {
  return `${event.date} · ${event.time}`;
}

/**
 * Milliseconds for an event's start, parsed from the stored `DD/MM/YYYY` and
 * `HH:mm` pair. Malformed values sort last instead of poisoning the comparison
 * with NaN.
 */
export function getEventStartTimestamp(event: Pick<EventRecord, 'date' | 'time'>) {
  const [day, month, year] = event.date.split('/').map(Number);
  const [hours, minutes] = event.time.split(':').map(Number);

  if ([day, month, year, hours, minutes].some((value) => !Number.isFinite(value))) {
    return Number.POSITIVE_INFINITY;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0).getTime();
}

/** Soonest first; events that already started keep their chronological order. */
export function compareByStart(
  left: Pick<EventRecord, 'date' | 'time'>,
  right: Pick<EventRecord, 'date' | 'time'>,
) {
  return getEventStartTimestamp(left) - getEventStartTimestamp(right);
}

export function formatAttendanceSummary(event: Pick<EventRecord, 'attendeeIds' | 'participantLimit'>) {
  return `${event.attendeeIds.length + 1}/${event.participantLimit}`;
}

export function getEventParticipantCount(event: Pick<EventRecord, 'attendeeIds'>) {
  return event.attendeeIds.length + 1;
}

export function getEventSpotsLeft(event: Pick<EventRecord, 'attendeeIds' | 'participantLimit'>) {
  return Math.max(event.participantLimit - getEventParticipantCount(event), 0);
}

export function getEventDistanceKm(eventId: string) {
  const seed = Array.from(eventId).reduce((total, character) => total + character.charCodeAt(0), 0);
  const km = 1.2 + (seed % 56) / 10;

  return km.toFixed(1);
}

export function eventMatchesSearch(
  event: Pick<EventRecord, 'creatorName' | 'meetingPoint' | 'title'>,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = `${event.title} ${event.meetingPoint} ${event.creatorName}`.toLowerCase();
  return haystack.includes(normalizedQuery);
}

export function formatNotificationLine(copy: AppCopy, notification: NotificationDigest) {
  if (notification.action === 'verification_approved' || notification.action === 'verification_rejected') {
    return notification.eventTitle;
  }

  if (notification.perspective === 'attendee') {
    const template =
      notification.action === 'cancelled'
        ? copy.home.notificationsCancelledReceived
        : notification.action === 'completed'
          ? copy.home.notificationsCompletedReceived
        : notification.action === 'invited'
          ? copy.home.notificationsInvitedReceived
          : copy.home.notificationsUpdatedReceived;

    return template.replace('{event}', notification.eventTitle);
  }

  const prefix =
    notification.action === 'cancelled'
      ? copy.home.notificationsCancelledPrefix
      : notification.action === 'completed'
        ? copy.home.notificationsCompletedPrefix
      : notification.action === 'invited'
        ? copy.home.notificationsInvitedPrefix
        : copy.home.notificationsUpdatedPrefix;

  return `${prefix} ${notification.audienceCount} ${copy.home.notificationsAudienceSuffix} · ${notification.eventTitle}`;
}

export function formatActivityLogLine(copy: AppCopy, activity: EventActivityLog) {
  if (activity.type === 'cancelled') {
    return `${copy.home.notificationsCancelledPrefix} ${activity.audienceCount} ${copy.home.notificationsAudienceSuffix}`;
  }

  if (activity.type === 'completed') {
    return `${copy.home.notificationsCompletedPrefix} ${activity.audienceCount} ${copy.home.notificationsAudienceSuffix}`;
  }

  if (activity.type === 'invited') {
    return `${copy.home.notificationsInvitedPrefix} ${activity.audienceCount} ${copy.home.notificationsAudienceSuffix}`;
  }

  if (activity.type === 'updated') {
    return `${copy.home.notificationsUpdatedPrefix} ${activity.audienceCount} ${copy.home.notificationsAudienceSuffix}`;
  }

  return '';
}

export function formatRatingValue(value: number) {
  return value.toFixed(1);
}

export function buildRatingStats(values: number[]): RatingStats {
  if (values.length === 0) {
    return {
      average: 0,
      count: 0,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    average: total / values.length,
    count: values.length,
  };
}
