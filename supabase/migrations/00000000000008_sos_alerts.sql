-- SOS v1: a one-tap panic trigger, not continuous live tracking.
--
-- Scope on purpose: this captures a single GPS fix at the moment a joined
-- attendee presses the SOS button during an event, records it, and notifies
-- the event's organizer in-app. Sending the SMS to her own trusted contacts
-- happens entirely on-device through the native Messages app (expo-sms) --
-- this backend never sees or stores contact phone numbers for delivery,
-- it only stores the ones she chose to save for herself.
--
-- Continuous background tracking shared live with contacts (the "v2" from
-- the roadmap) is a separate, much bigger change -- background location
-- permissions, a live map, and retention/consent decisions that are not
-- made yet -- and is intentionally not part of this migration.

-- ---------------------------------------------------------------------------
-- Trusted contacts she manages herself from Settings.
-- ---------------------------------------------------------------------------
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 120),
  phone_number text not null check (char_length(btrim(phone_number)) between 5 and 24),
  created_at timestamptz not null default timezone('utc', now())
);

create index emergency_contacts_user_idx on public.emergency_contacts (user_id);

alter table public.emergency_contacts enable row level security;

grant select, insert, delete on public.emergency_contacts to authenticated;
grant all on public.emergency_contacts to service_role;

create policy "emergency contacts readable by owner"
  on public.emergency_contacts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "emergency contacts insertable by owner"
  on public.emergency_contacts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "emergency contacts deletable by owner"
  on public.emergency_contacts
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Audit trail of SOS triggers. Written only through the RPC below.
-- ---------------------------------------------------------------------------
create table public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Nullable on purpose: if she denied/lost location permission, the alert
  -- must still go through without coordinates rather than being blocked.
  lat numeric(9, 6),
  lng numeric(9, 6),
  created_at timestamptz not null default timezone('utc', now())
);

create index sos_alerts_event_idx on public.sos_alerts (event_id, created_at);

alter table public.sos_alerts enable row level security;

grant select on public.sos_alerts to authenticated;
grant all on public.sos_alerts to service_role;

create policy "sos alerts readable by owner or organizer"
  on public.sos_alerts
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = sos_alerts.event_id
        and e.organizer_id = auth.uid()
    )
  );

-- Writes only happen through trigger_sos_alert; never direct from the client.
revoke insert, update, delete on public.sos_alerts from authenticated;

-- ---------------------------------------------------------------------------
-- The only way an SOS gets recorded and the organizer notified.
-- ---------------------------------------------------------------------------
create or replace function public.trigger_sos_alert(
  p_event_id uuid,
  p_lat numeric,
  p_lng numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_event public.events;
  v_caller_name text;
  v_alert_id uuid;
begin
  if v_caller is null then
    return jsonb_build_object('status', 'not_authenticated');
  end if;

  select * into v_event from public.events where id = p_event_id;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  -- Only someone actually joined to this event can raise an SOS for it.
  if not public.is_joined_event_participant(p_event_id, v_caller) then
    return jsonb_build_object('status', 'not_participant');
  end if;

  insert into public.sos_alerts (event_id, user_id, lat, lng)
  values (p_event_id, v_caller, p_lat, p_lng)
  returning id into v_alert_id;

  select coalesce(nullif(trim(full_name), ''), 'Una integrante')
    into v_caller_name
    from public.profiles
   where id = v_caller;

  insert into public.notifications (user_id, event_id, type, title, body, metadata)
  values (
    v_event.organizer_id,
    p_event_id,
    'sos',
    'Alerta SOS',
    v_caller_name || ' activó el SOS en "' || v_event.title || '"'
      || case
           when p_lat is not null and p_lng is not null then '.'
           else ' (sin ubicación disponible).'
         end,
    jsonb_build_object(
      'action', 'sos',
      'event_id', p_event_id,
      'event_title', v_event.title,
      'sos_alert_id', v_alert_id,
      'lat', p_lat,
      'lng', p_lng
    )
  );

  return jsonb_build_object('status', 'sent', 'alertId', v_alert_id, 'organizerNotified', true);
end;
$$;

revoke all on function public.trigger_sos_alert(uuid, numeric, numeric) from public, anon;
grant execute on function public.trigger_sos_alert(uuid, numeric, numeric) to authenticated;
