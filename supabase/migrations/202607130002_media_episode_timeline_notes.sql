alter table public.media_episodes
add column if not exists timeline_notes jsonb not null default '[]'::jsonb;

alter table public.media_episodes
drop constraint if exists media_episodes_timeline_notes_array;

alter table public.media_episodes
add constraint media_episodes_timeline_notes_array check (
  jsonb_typeof(timeline_notes) = 'array'
);

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
      or exists (
        select 1
        from jsonb_array_elements(episode.timeline_notes) as note
        where note ->> 'content' ilike '%' || btrim(p_keyword) || '%'
           or note ->> 'timecode' = btrim(p_keyword)
      )
      or episode.episode_number::text = btrim(p_keyword)
    )
  order by episode.updated_at desc, entry.title, season.sort_order, episode.episode_number;
$$;
