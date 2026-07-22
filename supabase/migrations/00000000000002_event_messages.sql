-- Group chat per event: text-only messages (emojis are just unicode text),
-- persisted as the event's chat history.
create table public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default timezone('utc', now())
);

create index event_messages_event_created_idx
  on public.event_messages (event_id, created_at);

alter table public.event_messages enable row level security;

grant select, insert on public.event_messages to authenticated;
grant all on public.event_messages to service_role;

-- Only the organizer or a joined participant can read the event's chat.
create policy "event messages readable by participants"
  on public.event_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.events e
      where e.id = event_messages.event_id
        and e.organizer_id = auth.uid()
    )
    or public.is_joined_event_participant(event_messages.event_id, auth.uid())
  );

-- A user can only post as themselves, and only in events they organize or joined.
create policy "event messages insertable by participants"
  on public.event_messages
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1
        from public.events e
        where e.id = event_messages.event_id
          and e.organizer_id = auth.uid()
      )
      or public.is_joined_event_participant(event_messages.event_id, auth.uid())
    )
  );

-- Live updates for open chats.
alter publication supabase_realtime add table public.event_messages;
