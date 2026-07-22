-- Gym joins the sport catalogue. The enum backs events.sport and
-- profiles.favorite_sports, so it has to know the value before the app can
-- create or filter gym outings.
alter type public.sport_type add value if not exists 'gym';
