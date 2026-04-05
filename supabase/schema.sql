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

create type public.group_member_status as enum (
  'pending',
  'accepted',
  'rejected',
  'blocked'
);

create type public.notification_type as enum (
  'event_joined',
  'event_reminder',
  'group_request_approved',
  'group_request_rejected',
  'verification_approved',
  'verification_rejected'
);

create type public.event_visibility as enum (
  'public',
  'group_only'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  rut text unique,
  avatar_url text,
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
  description text not null,
  sport public.sport_type not null,
  starts_at timestamptz not null,
  location_name text not null,
  meeting_point text,
  lat numeric(9, 6) not null,
  lng numeric(9, 6) not null,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  visibility public.event_visibility not null default 'public',
  private_code text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  max_participants integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'joined' check (status in ('joined', 'removed', 'blocked')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id)
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
  type public.notification_type not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
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

alter table public.profiles enable row level security;
alter table public.verification_submissions enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.user_safety_blocks enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are readable by owner"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

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

create policy "verification submissions insertable by owner"
  on public.verification_submissions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

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
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_verified = true
    )
  );

create policy "events creatable by verified users"
  on public.events
  for insert
  to authenticated
  with check (
    auth.uid() = organizer_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_verified = true
    )
  );

create policy "participants can see own event join rows"
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
  );

create policy "verified users can join events"
  on public.event_participants
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_verified = true
    )
  );

create policy "notifications readable by owner"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

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
