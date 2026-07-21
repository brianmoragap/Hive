create extension if not exists "pgcrypto";

create type public.sport_type as enum (
  'road_cycling',
  'mtb',
  'running',
  'trekking',
  'trail_running'
);

create type public.verification_status as enum (
  'unsubmitted',
  'pending',
  'approved',
  'rejected'
);

create type public.admin_role as enum (
  'reviewer',
  'admin'
);

create type public.group_member_status as enum (
  'pending',
  'accepted',
  'rejected',
  'blocked'
);

create type public.notification_type as enum (
  'updated',
  'invited',
  'completed',
  'cancelled',
  'event_joined',
  'event_reminder',
  'group_request_approved',
  'group_request_rejected',
  'verification_approved',
  'verification_rejected'
);

create type public.event_visibility as enum (
  'public',
  'private'
);

create type public.event_status as enum (
  'scheduled',
  'completed',
  'cancelled'
);

create type public.skill_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.event_activity_type as enum (
  'created',
  'updated',
  'invited',
  'completed',
  'cancelled'
);

create type public.event_participant_status as enum (
  'joined',
  'removed',
  'blocked'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  handle text unique,
  city text,
  rut text unique,
  phone_number text,
  phone_verified boolean not null default false,
  phone_verified_at timestamptz,
  birth_date date,
  avatar_url text,
  onboarding_completed boolean not null default false,
  is_verified boolean not null default false,
  verification_status public.verification_status not null default 'unsubmitted',
  favorite_sports public.sport_type[] not null default '{}',
  events_attended_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  verified_at timestamptz
);

create table public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  rut text not null,
  front_document_path text not null,
  serial_document_path text not null,
  status public.verification_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

create unique index verification_submissions_one_pending_per_user
  on public.verification_submissions (user_id)
  where status = 'pending';

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  invite_slug text not null unique,
  verified_only boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.group_member_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (group_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sport public.sport_type not null,
  skill_level public.skill_level not null default 'beginner',
  starts_at timestamptz not null,
  location_name text not null default '',
  meeting_point text not null,
  lat numeric(9, 6),
  lng numeric(9, 6),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  visibility public.event_visibility not null default 'public',
  status public.event_status not null default 'scheduled',
  verified_only boolean not null default true,
  share_slug text not null unique default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  private_code text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  max_participants integer not null default 12,
  completed_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.event_participant_status not null default 'joined',
  joined_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id)
);

create table public.event_attendance_passes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  pass_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  manual_code text not null unique,
  issued_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id) on delete set null,
  unique (event_id, user_id)
);

create table public.event_activity_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  activity_type public.event_activity_type not null,
  audience_count integer not null default 0,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_name text not null,
  event_rating integer not null check (event_rating between 1 and 5),
  organizer_rating integer not null check (organizer_rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  unique (event_id, reviewer_id)
);

create table public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  invited_user_id uuid references public.profiles(id) on delete cascade,
  invite_channel text not null check (invite_channel in ('directory', 'link')),
  invite_token text not null unique default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14)),
  status text not null default 'sent' check (status in ('sent', 'accepted', 'revoked')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_safety_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.admin_role not null default 'reviewer',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.verification_review_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.verification_submissions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  decision public.verification_status not null,
  reviewer_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.list_hive_members()
returns table (
  id uuid,
  full_name text,
  handle text,
  city text,
  favorite_sport public.sport_type,
  is_verified boolean,
  avatar_url text,
  email text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(nullif(trim(p.full_name), ''), initcap(replace(split_part(coalesce(p.email, 'hive.member'), '@', 1), '.', ' '))) as full_name,
    coalesce(
      nullif(trim(p.handle), ''),
      '@' || lower(
        regexp_replace(
          coalesce(nullif(trim(p.full_name), ''), split_part(coalesce(p.email, 'hive.member'), '@', 1)),
          '[^a-zA-Z0-9]+',
          '.',
          'g'
        )
      )
    ) as handle,
    coalesce(nullif(trim(p.city), ''), 'Santiago') as city,
    coalesce(p.favorite_sports[1], 'running'::public.sport_type) as favorite_sport,
    p.is_verified,
    p.avatar_url,
    p.email
  from public.profiles p
  where p.onboarding_completed = true
    or p.is_verified = true
    or p.id = auth.uid();
$$;

create or replace function public.is_admin_user(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = p_user_id
  );
$$;

create or replace function public.is_verified_profile(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.is_verified = true
  );
$$;

create or replace function public.list_verification_queue(
  p_status public.verification_status default null,
  p_search text default null
)
returns table (
  submission_id uuid,
  user_id uuid,
  email text,
  profile_full_name text,
  submission_full_name text,
  rut text,
  birth_date date,
  phone_number text,
  avatar_url text,
  status public.verification_status,
  reviewer_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  front_document_path text,
  serial_document_path text
)
language sql
security definer
set search_path = public
as $$
  select
    vs.id as submission_id,
    vs.user_id,
    p.email,
    p.full_name as profile_full_name,
    vs.full_name as submission_full_name,
    vs.rut,
    p.birth_date,
    p.phone_number,
    p.avatar_url,
    vs.status,
    vs.reviewer_notes,
    vs.submitted_at,
    vs.reviewed_at,
    vs.front_document_path,
    vs.serial_document_path
  from public.verification_submissions vs
  join public.profiles p on p.id = vs.user_id
  where public.is_admin_user(auth.uid())
    and (p_status is null or vs.status = p_status)
    and (
      p_search is null
      or trim(p_search) = ''
      or coalesce(vs.full_name, '') ilike '%' || trim(p_search) || '%'
      or coalesce(p.full_name, '') ilike '%' || trim(p_search) || '%'
      or coalesce(p.email, '') ilike '%' || trim(p_search) || '%'
      or coalesce(vs.rut, '') ilike '%' || trim(p_search) || '%'
    )
  order by
    case when vs.status = 'pending' then 0 else 1 end,
    vs.submitted_at desc;
$$;

create or replace function public.is_joined_event_participant(p_event_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_participants ep
    where ep.event_id = p_event_id
      and ep.user_id = p_user_id
      and ep.status = 'joined'
  );
$$;

create or replace function public.is_pending_event_invitee(p_event_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_invites ei
    where ei.event_id = p_event_id
      and ei.invited_user_id = p_user_id
      and ei.status = 'sent'
  );
$$;

create or replace function public.can_access_event(p_event_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = p_event_id
      and (
        e.organizer_id = p_user_id
        or (e.visibility = 'public' and public.is_verified_profile(p_user_id))
        or public.is_joined_event_participant(e.id, p_user_id)
        or public.is_pending_event_invitee(e.id, p_user_id)
      )
  );
$$;

grant execute on function public.list_hive_members() to authenticated;
grant execute on function public.is_admin_user(uuid) to authenticated;
grant execute on function public.is_verified_profile(uuid) to authenticated;
grant execute on function public.list_verification_queue(public.verification_status, text) to authenticated;
grant execute on function public.is_joined_event_participant(uuid, uuid) to authenticated;
grant execute on function public.is_pending_event_invitee(uuid, uuid) to authenticated;
grant execute on function public.can_access_event(uuid, uuid) to authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger groups_set_updated_at
  before update on public.groups
  for each row execute procedure public.set_updated_at();

create trigger group_members_set_updated_at
  before update on public.group_members
  for each row execute procedure public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

create trigger event_participants_set_updated_at
  before update on public.event_participants
  for each row execute procedure public.set_updated_at();

create trigger event_invites_set_updated_at
  before update on public.event_invites
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.verification_submissions enable row level security;
alter table public.admin_users enable row level security;
alter table public.verification_review_logs enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_attendance_passes enable row level security;
alter table public.event_activity_logs enable row level security;
alter table public.event_reviews enable row level security;
alter table public.event_invites enable row level security;
alter table public.user_safety_blocks enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;

create policy "profiles are readable by owner"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles are readable by admins"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin_user(auth.uid()));

create policy "profiles are insertable by owner"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "verification submissions readable by owner"
  on public.verification_submissions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "verification submissions readable by admins"
  on public.verification_submissions
  for select
  to authenticated
  using (public.is_admin_user(auth.uid()));

create policy "verification submissions insertable by owner"
  on public.verification_submissions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "admin users readable by admins"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin_user(auth.uid()));

create policy "verification review logs readable by admins"
  on public.verification_review_logs
  for select
  to authenticated
  using (public.is_admin_user(auth.uid()));

create policy "groups visible to creator or accepted member"
  on public.groups
  for select
  to authenticated
  using (
    auth.uid() = creator_id
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.status = 'accepted'
    )
  );

create policy "groups creatable by verified profiles"
  on public.groups
  for insert
  to authenticated
  with check (
    auth.uid() = creator_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_verified = true
    )
  );

create policy "group members visible to accepted members"
  on public.group_members
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.groups g
      where g.id = group_id
        and g.creator_id = auth.uid()
    )
  );

create policy "group members insert own request"
  on public.group_members
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "events visible to verified users"
  on public.events
  for select
  to authenticated
  using (
    (
      visibility = 'public'
      and public.is_verified_profile(auth.uid())
    )
    or organizer_id = auth.uid()
    or public.is_joined_event_participant(events.id, auth.uid())
    or public.is_pending_event_invitee(events.id, auth.uid())
  );

create policy "events creatable by verified users"
  on public.events
  for insert
  to authenticated
  with check (
    auth.uid() = organizer_id
    and public.is_verified_profile(auth.uid())
  );

create policy "events updatable by organizer"
  on public.events
  for update
  to authenticated
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

create policy "participants visible when event is visible"
  on public.event_participants
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
    or public.is_joined_event_participant(event_id, auth.uid())
  );

create policy "participants insertable by self or organizer"
  on public.event_participants
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and (
          auth.uid() = user_id
          or e.organizer_id = auth.uid()
        )
    )
  );

create policy "participants updatable by self or organizer"
  on public.event_participants
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and (
          auth.uid() = user_id
          or e.organizer_id = auth.uid()
        )
    )
  )
  with check (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and (
          auth.uid() = user_id
          or e.organizer_id = auth.uid()
        )
    )
  );

create policy "attendance passes readable by attendee or organizer"
  on public.event_attendance_passes
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );

create policy "attendance passes insertable by attendee or organizer"
  on public.event_attendance_passes
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );

create policy "attendance passes updatable by attendee or organizer"
  on public.event_attendance_passes
  for update
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );

create policy "activity logs visible when event is visible"
  on public.event_activity_logs
  for select
  to authenticated
  using (
    public.can_access_event(event_id, auth.uid())
  );

create policy "activity logs insertable by organizer"
  on public.event_activity_logs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );

create policy "reviews visible when event is visible"
  on public.event_reviews
  for select
  to authenticated
  using (
    public.can_access_event(event_id, auth.uid())
  );

create policy "reviews insertable by joined attendee on completed events"
  on public.event_reviews
  for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.status = 'completed'
        and e.organizer_id <> auth.uid()
        and public.is_joined_event_participant(e.id, auth.uid())
    )
  );

create policy "event invites visible to invited user or organizer"
  on public.event_invites
  for select
  to authenticated
  using (
    auth.uid() = created_by
    or auth.uid() = invited_user_id
  );

create policy "organizer can create event invites"
  on public.event_invites
  for insert
  to authenticated
  with check (
    auth.uid() = created_by
    and exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );

create policy "notifications readable by owner"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "notifications insertable by owner"
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "organizer can notify event participants"
  on public.notifications
  for insert
  to authenticated
  with check (
    event_id is not null
    and exists (
      select 1
      from public.events e
      where e.id = notifications.event_id
        and e.organizer_id = auth.uid()
    )
    and public.is_joined_event_participant(notifications.event_id, notifications.user_id)
  );

create policy "notifications updatable by owner"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

create policy "users upload own verification docs"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users read own verification docs"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "admins read verification docs"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and public.is_admin_user(auth.uid())
  );
