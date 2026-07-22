-- Attendance passes: server-authoritative issuing, capacity and check-in.
--
-- Before this migration every guarantee lived in the client: passes were
-- generated in JS, the capacity check was a local comparison and burning a pass
-- was a plain UPDATE that RLS also allowed the attendee herself to run. This
-- moves all of it into Postgres so a pass can only be burned by the organizer,
-- only once, only for its own event and only while there are spots left.

-- ---------------------------------------------------------------------------
-- Manual (6 digit) fallback code, unique across the table.
-- ---------------------------------------------------------------------------
create or replace function public.generate_manual_pass_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_tries integer := 0;
begin
  loop
    v_code := lpad((floor(random() * 1000000))::integer::text, 6, '0');

    exit when not exists (
      select 1 from public.event_attendance_passes where manual_code = v_code
    );

    v_tries := v_tries + 1;

    -- Extremely unlikely; fall back to a wider code instead of looping forever.
    if v_tries > 50 then
      v_code := v_code || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
      exit;
    end if;
  end loop;

  return upper(v_code);
end;
$$;

-- ---------------------------------------------------------------------------
-- A pass is issued/revoked automatically from the participant status.
-- Re-joining rotates the token so an old screenshot of the QR is useless.
-- ---------------------------------------------------------------------------
create or replace function public.sync_attendance_pass()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'joined' then
    insert into public.event_attendance_passes (event_id, user_id, manual_code)
    values (new.event_id, new.user_id, public.generate_manual_pass_code())
    on conflict (event_id, user_id) do update
      set revoked_at = null,
          pass_token = replace(gen_random_uuid()::text, '-', ''),
          manual_code = public.generate_manual_pass_code(),
          checked_in_at = null,
          checked_in_by = null,
          issued_at = timezone('utc', now())
      where public.event_attendance_passes.revoked_at is not null;
  else
    update public.event_attendance_passes
       set revoked_at = coalesce(revoked_at, timezone('utc', now()))
     where event_id = new.event_id
       and user_id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists event_participants_sync_pass on public.event_participants;
create trigger event_participants_sync_pass
after insert or update of status on public.event_participants
for each row execute function public.sync_attendance_pass();

-- ---------------------------------------------------------------------------
-- Capacity. max_participants counts the organizer, so joined attendees are
-- capped at max_participants - 1. The event row is locked to serialize
-- concurrent joins racing for the last spot.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_event_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max integer;
  v_joined integer;
begin
  if new.status <> 'joined' then
    return new;
  end if;

  select max_participants into v_max
    from public.events
   where id = new.event_id
     for update;

  if v_max is null then
    return new;
  end if;

  select count(*) into v_joined
    from public.event_participants
   where event_id = new.event_id
     and status = 'joined'
     and (tg_op = 'INSERT' or user_id <> new.user_id);

  if v_joined >= greatest(v_max - 1, 0) then
    raise exception 'EVENT_FULL' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists event_participants_capacity on public.event_participants;
create trigger event_participants_capacity
before insert or update of status on public.event_participants
for each row execute function public.enforce_event_capacity();

-- ---------------------------------------------------------------------------
-- Burning a pass. Accepts either the serialized QR payload or the manual code.
-- ---------------------------------------------------------------------------
create or replace function public.check_in_event_pass(
  p_event_id uuid,
  p_raw_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_event public.events;
  v_code text := btrim(coalesce(p_raw_code, ''));
  v_payload jsonb;
  v_token text;
  v_manual text;
  v_payload_event uuid;
  v_pass public.event_attendance_passes;
  v_capacity integer;
  v_checked integer;
begin
  if v_caller is null then
    return jsonb_build_object('status', 'not_host');
  end if;

  select * into v_event from public.events where id = p_event_id;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  -- Only the host burns passes.
  if v_event.organizer_id <> v_caller then
    return jsonb_build_object('status', 'not_host');
  end if;

  if v_event.status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled');
  end if;

  if v_event.status = 'completed' then
    return jsonb_build_object('status', 'completed');
  end if;

  if v_code = '' then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_code like 'HIVE_EVENT_PASS:%' then
    begin
      v_payload := substr(v_code, length('HIVE_EVENT_PASS:') + 1)::jsonb;
    exception when others then
      return jsonb_build_object('status', 'invalid');
    end;

    if v_payload->>'type' is distinct from 'hive_event_pass' then
      return jsonb_build_object('status', 'invalid');
    end if;

    begin
      v_payload_event := (v_payload->>'eventId')::uuid;
    exception when others then
      return jsonb_build_object('status', 'invalid');
    end;

    -- A pass from another event never burns here.
    if v_payload_event is distinct from p_event_id then
      return jsonb_build_object('status', 'event_mismatch');
    end if;

    v_token := v_payload->>'token';

    if v_token is null or v_token = '' then
      return jsonb_build_object('status', 'invalid');
    end if;

    select * into v_pass
      from public.event_attendance_passes
     where pass_token = v_token
       for update;
  else
    v_manual := upper(regexp_replace(v_code, '\s', '', 'g'));

    select * into v_pass
      from public.event_attendance_passes
     where manual_code = v_manual
       for update;
  end if;

  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  -- Second guard: the pass row itself must belong to this event.
  if v_pass.event_id <> p_event_id then
    return jsonb_build_object('status', 'event_mismatch');
  end if;

  if v_pass.revoked_at is not null then
    return jsonb_build_object('status', 'revoked', 'attendeeId', v_pass.user_id);
  end if;

  if not exists (
    select 1
      from public.event_participants ep
     where ep.event_id = p_event_id
       and ep.user_id = v_pass.user_id
       and ep.status = 'joined'
  ) then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_pass.checked_in_at is not null then
    return jsonb_build_object(
      'status', 'already_checked_in',
      'attendeeId', v_pass.user_id,
      'checkedInAt', v_pass.checked_in_at
    );
  end if;

  v_capacity := greatest(coalesce(v_event.max_participants, 0) - 1, 0);

  select count(*) into v_checked
    from public.event_attendance_passes
   where event_id = p_event_id
     and revoked_at is null
     and checked_in_at is not null;

  if v_checked >= v_capacity then
    return jsonb_build_object('status', 'full', 'checkedInCount', v_checked, 'capacity', v_capacity);
  end if;

  update public.event_attendance_passes
     set checked_in_at = timezone('utc', now()),
         checked_in_by = v_caller
   where id = v_pass.id;

  return jsonb_build_object(
    'status', 'checked_in',
    'attendeeId', v_pass.user_id,
    'checkedInCount', v_checked + 1,
    'capacity', v_capacity
  );
end;
$$;

-- Trigger/helper functions must not be reachable through PostgREST at all;
-- burning a pass requires a signed-in session (the function then checks that
-- the caller is the organizer).
revoke all on function public.sync_attendance_pass() from public, anon, authenticated;
revoke all on function public.enforce_event_capacity() from public, anon, authenticated;
revoke all on function public.generate_manual_pass_code() from public, anon, authenticated;
revoke all on function public.check_in_event_pass(uuid, text) from public, anon;
grant execute on function public.check_in_event_pass(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Lock the table down: passes are readable by their owner and the organizer,
-- but written only by the trigger and the RPC above (both security definer).
-- ---------------------------------------------------------------------------
drop policy if exists "attendance passes updatable by attendee or organizer"
  on public.event_attendance_passes;
drop policy if exists "attendance passes insertable by attendee or organizer"
  on public.event_attendance_passes;

revoke insert, update, delete on public.event_attendance_passes from authenticated;

-- ---------------------------------------------------------------------------
-- Backfill passes for participants that joined before the trigger existed.
-- ---------------------------------------------------------------------------
insert into public.event_attendance_passes (event_id, user_id, manual_code)
select ep.event_id, ep.user_id, public.generate_manual_pass_code()
  from public.event_participants ep
 where ep.status = 'joined'
   and not exists (
     select 1
       from public.event_attendance_passes ap
      where ap.event_id = ep.event_id
        and ap.user_id = ep.user_id
   );
