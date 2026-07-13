create or replace function public.create_media_season_with_episodes(
  p_media_entry_id uuid,
  p_name text,
  p_episode_count integer default 0
)
returns setof public.media_seasons
language plpgsql
security definer
set search_path = public
as $$
declare
  next_order bigint;
  created_season public.media_seasons;
  entry_media_type text;
begin
  if p_episode_count < 0 or p_episode_count > 500 then
    raise exception 'invalid episode count' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('public.media_seasons:' || p_media_entry_id::text, 0));
  select media_type into entry_media_type
  from public.media_entries where id = p_media_entry_id for update;
  if entry_media_type is null then
    raise exception 'media entry not found' using errcode = 'P0002';
  end if;
  if not (
    entry_media_type = any(array['电视剧', '动漫', '动画', '动画片', '广播剧']::text[])
  ) then
    raise exception 'media type is not episodic' using errcode = '22023';
  end if;

  select coalesce(max(sort_order), 0) + 1000 into next_order
  from public.media_seasons where media_entry_id = p_media_entry_id;

  insert into public.media_seasons (media_entry_id, name, sort_order)
  values (p_media_entry_id, btrim(p_name), next_order)
  returning * into created_season;

  if p_episode_count > 0 then
    insert into public.media_episodes (season_id, episode_number)
    select created_season.id, number
    from generate_series(1, p_episode_count) as number;
  end if;

  return next created_season;
end;
$$;
