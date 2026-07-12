alter table public.media_entries
add column if not exists is_revisitable boolean not null default false,
add column if not exists season_count integer not null default 0 check (season_count >= 0),
add column if not exists episode_count integer not null default 0 check (episode_count >= 0),
add column if not exists favorite_episode_count integer not null default 0 check (favorite_episode_count >= 0);

create table if not exists public.media_seasons (
  id uuid primary key default gen_random_uuid(),
  media_entry_id uuid not null references public.media_entries(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists media_seasons_entry_name_unique
on public.media_seasons (media_entry_id, lower(btrim(name)));

create index if not exists media_seasons_entry_sort_idx
on public.media_seasons (media_entry_id, sort_order);

create table if not exists public.media_episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.media_seasons(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null default '' check (char_length(title) <= 120),
  plot_summary text not null default '' check (char_length(plot_summary) <= 2000),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_episodes_season_number_unique unique (season_id, episode_number)
);

create index if not exists media_episodes_season_number_idx
on public.media_episodes (season_id, episode_number);

create index if not exists media_episodes_favorite_idx
on public.media_episodes (is_favorite)
where is_favorite;

create or replace function public.refresh_media_entry_episode_stats(p_media_entry_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.media_entries as entry
  set season_count = stats.season_count,
      episode_count = stats.episode_count,
      favorite_episode_count = stats.favorite_episode_count
  from (
    select
      count(distinct season.id)::integer as season_count,
      count(episode.id)::integer as episode_count,
      count(episode.id) filter (where episode.is_favorite)::integer as favorite_episode_count
    from public.media_seasons as season
    left join public.media_episodes as episode on episode.season_id = season.id
    where season.media_entry_id = p_media_entry_id
  ) as stats
  where entry.id = p_media_entry_id;
$$;

create or replace function public.media_seasons_refresh_stats()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.refresh_media_entry_episode_stats(
    case when tg_op = 'DELETE' then old.media_entry_id else new.media_entry_id end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.media_episodes_refresh_stats()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected_entry_id uuid;
begin
  select media_entry_id into affected_entry_id
  from public.media_seasons
  where id = case when tg_op = 'DELETE' then old.season_id else new.season_id end;

  if affected_entry_id is not null then
    perform public.refresh_media_entry_episode_stats(affected_entry_id);
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists media_seasons_set_updated_at on public.media_seasons;
create trigger media_seasons_set_updated_at
before update on public.media_seasons
for each row execute function public.set_updated_at();

drop trigger if exists media_episodes_set_updated_at on public.media_episodes;
create trigger media_episodes_set_updated_at
before update on public.media_episodes
for each row execute function public.set_updated_at();

drop trigger if exists media_seasons_refresh_stats_trigger on public.media_seasons;
create trigger media_seasons_refresh_stats_trigger
after insert or delete on public.media_seasons
for each row execute function public.media_seasons_refresh_stats();

drop trigger if exists media_episodes_refresh_stats_trigger on public.media_episodes;
create trigger media_episodes_refresh_stats_trigger
after insert or update of is_favorite or delete on public.media_episodes
for each row execute function public.media_episodes_refresh_stats();

create or replace function public.create_media_season_with_episodes(
  p_media_entry_id uuid,
  p_name text,
  p_episode_count integer
)
returns setof public.media_seasons
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_season public.media_seasons;
  next_order bigint;
  entry_media_type text;
begin
  if p_episode_count < 0 or p_episode_count > 500 then
    raise exception using errcode = '22023', message = '集数必须在 0 到 500 之间';
  end if;

  select media_type into entry_media_type
  from public.media_entries where id = p_media_entry_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = '影视条目不存在';
  end if;
  if not (entry_media_type = any(array['电视剧', '动漫', '动画', '广播剧']::text[])) then
    raise exception using errcode = '22023', message = '该影视分类不支持分季和单集';
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

create or replace function public.add_next_media_episode(p_season_id uuid)
returns setof public.media_episodes
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_number integer;
begin
  perform id from public.media_seasons where id = p_season_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = '季不存在';
  end if;

  select coalesce(max(episode_number), 0) + 1 into next_number
  from public.media_episodes where season_id = p_season_id;

  return query
  insert into public.media_episodes (season_id, episode_number)
  values (p_season_id, next_number)
  returning *;
end;
$$;

create or replace function public.search_favorite_media_episodes(
  p_media_type text,
  p_keyword text default ''
)
returns table (
  id uuid,
  season_id uuid,
  media_entry_id uuid,
  media_title text,
  media_type text,
  platforms text[],
  season_name text,
  episode_number integer,
  episode_title text,
  plot_summary text,
  updated_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    episode.id,
    season.id,
    entry.id,
    entry.title,
    entry.media_type,
    entry.platforms,
    season.name,
    episode.episode_number,
    episode.title,
    episode.plot_summary,
    episode.updated_at
  from public.media_episodes as episode
  join public.media_seasons as season on season.id = episode.season_id
  join public.media_entries as entry on entry.id = season.media_entry_id
  where episode.is_favorite
    and entry.media_type = p_media_type
    and (
      coalesce(btrim(p_keyword), '') = ''
      or entry.title ilike '%' || btrim(p_keyword) || '%'
      or season.name ilike '%' || btrim(p_keyword) || '%'
      or episode.title ilike '%' || btrim(p_keyword) || '%'
      or episode.plot_summary ilike '%' || btrim(p_keyword) || '%'
      or episode.episode_number::text = btrim(p_keyword)
    )
  order by episode.updated_at desc, entry.title, season.sort_order, episode.episode_number;
$$;

alter table public.media_seasons enable row level security;
alter table public.media_episodes enable row level security;

grant select, insert, update, delete on table public.media_seasons, public.media_episodes to service_role;
revoke all on function public.refresh_media_entry_episode_stats(uuid) from public, anon, authenticated;
revoke all on function public.create_media_season_with_episodes(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.add_next_media_episode(uuid) from public, anon, authenticated;
revoke all on function public.search_favorite_media_episodes(text, text) from public, anon, authenticated;
grant execute on function public.refresh_media_entry_episode_stats(uuid) to service_role;
grant execute on function public.create_media_season_with_episodes(uuid, text, integer) to service_role;
grant execute on function public.add_next_media_episode(uuid) to service_role;
grant execute on function public.search_favorite_media_episodes(text, text) to service_role;
