import type { EventAttendancePass, EventPassPayload } from '../types/domain';

const EVENT_PASS_PREFIX = 'HIVE_EVENT_PASS:';

export function buildEventPassPayload(
  eventId: string,
  pass: Pick<EventAttendancePass, 'issuedAt' | 'token' | 'userId'>,
): EventPassPayload {
  return {
    type: 'hive_event_pass',
    version: 1,
    eventId,
    issuedAt: pass.issuedAt,
    token: pass.token,
    userId: pass.userId,
  };
}

export function serializeEventPassPayload(payload: EventPassPayload) {
  return `${EVENT_PASS_PREFIX}${JSON.stringify(payload)}`;
}

export function parseEventPassPayload(rawValue: string) {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue.startsWith(EVENT_PASS_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmedValue.slice(EVENT_PASS_PREFIX.length)) as Partial<EventPassPayload>;

    if (
      parsed.type !== 'hive_event_pass' ||
      parsed.version !== 1 ||
      typeof parsed.eventId !== 'string' ||
      typeof parsed.issuedAt !== 'string' ||
      typeof parsed.token !== 'string' ||
      typeof parsed.userId !== 'string'
    ) {
      return null;
    }

    return parsed as EventPassPayload;
  } catch {
    return null;
  }
}

export function normalizeManualPassCode(value: string) {
  return value.replace(/\s+/g, '').trim().toUpperCase();
}

export function formatManualPassCode(value: string) {
  const normalizedValue = normalizeManualPassCode(value);

  if (normalizedValue.length <= 3) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, 3)} ${normalizedValue.slice(3)}`;
}
