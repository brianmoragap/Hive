-- The organizer can edit an event to raise or lower the spot limit, but never
-- below the women already joined (she takes one spot herself, hence joined + 1).
-- Without this an edit could leave the event over capacity, which would break
-- the guarantee that exactly `max_participants` people can be checked in.
create or replace function public.enforce_event_capacity_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_joined integer;
begin
  if new.max_participants is null
     or new.max_participants is not distinct from old.max_participants then
    return new;
  end if;

  select count(*) into v_joined
    from public.event_participants
   where event_id = new.id
     and status = 'joined';

  -- The client parses this message to show the floor it can accept.
  if new.max_participants < v_joined + 1 then
    raise exception 'CAPACITY_BELOW_JOINED:%', v_joined + 1 using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists events_capacity_guard on public.events;
create trigger events_capacity_guard
before update of max_participants on public.events
for each row execute function public.enforce_event_capacity_update();

revoke all on function public.enforce_event_capacity_update() from public, anon, authenticated;
