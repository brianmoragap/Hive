-- Attendees previously never got a real notification when the organizer
-- updated, cancelled or completed an event, or invited them: the client only
-- had permission to insert a notification row for itself (the organizer),
-- never for the audience. This lets the organizer notify joined participants
-- of her own event, so the attendee-facing rows the app already writes can
-- actually be persisted.
alter table public.notifications
  add column if not exists event_id uuid references public.events(id) on delete cascade;

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
