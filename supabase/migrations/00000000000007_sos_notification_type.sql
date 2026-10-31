-- Kept in its own migration: a brand new enum value cannot be referenced by
-- name in the same transaction that adds it (see 00000000000005, which does
-- the same thing for the "gym" sport value).
alter type public.notification_type add value if not exists 'sos';
