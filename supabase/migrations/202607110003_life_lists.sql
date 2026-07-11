create table if not exists public.media_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  media_type text not null check (
    media_type in ('电影', '电视剧', '动漫', '动画', '广播剧', '小说')
  ),
  watch_status text not null default 'planned' check (
    watch_status in ('planned', 'in_progress', 'completed')
  ),
  platforms text[] not null default '{}',
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_entries_type_sort_idx
on public.media_entries(media_type, sort_order);
create index if not exists media_entries_status_idx
on public.media_entries(watch_status);

create table if not exists public.activity_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  activity_type text not null check (
    activity_type in ('室内', '户外', '居家')
  ),
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_items_type_sort_idx
on public.activity_items(activity_type, sort_order);

create table if not exists public.luggage_scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.luggage_groups (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.luggage_scenes(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  is_required boolean not null default false,
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists luggage_one_required_group_idx
on public.luggage_groups(scene_id)
where is_required;
create index if not exists luggage_groups_scene_sort_idx
on public.luggage_groups(scene_id, sort_order);

create table if not exists public.luggage_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.luggage_groups(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists luggage_items_group_sort_idx
on public.luggage_items(group_id, sort_order);

create table if not exists public.dining_places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  service_modes text[] not null default '{}',
  menu_items text[] not null default '{}',
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dining_service_modes_valid check (
    cardinality(service_modes) > 0
    and service_modes <@ array['takeout', 'dine_in']::text[]
  )
);

create index if not exists dining_places_sort_idx
on public.dining_places(sort_order);

drop trigger if exists media_entries_set_updated_at on public.media_entries;
create trigger media_entries_set_updated_at
before update on public.media_entries
for each row execute function public.set_updated_at();

drop trigger if exists activity_items_set_updated_at on public.activity_items;
create trigger activity_items_set_updated_at
before update on public.activity_items
for each row execute function public.set_updated_at();

drop trigger if exists luggage_scenes_set_updated_at on public.luggage_scenes;
create trigger luggage_scenes_set_updated_at
before update on public.luggage_scenes
for each row execute function public.set_updated_at();

drop trigger if exists luggage_groups_set_updated_at on public.luggage_groups;
create trigger luggage_groups_set_updated_at
before update on public.luggage_groups
for each row execute function public.set_updated_at();

drop trigger if exists luggage_items_set_updated_at on public.luggage_items;
create trigger luggage_items_set_updated_at
before update on public.luggage_items
for each row execute function public.set_updated_at();

drop trigger if exists dining_places_set_updated_at on public.dining_places;
create trigger dining_places_set_updated_at
before update on public.dining_places
for each row execute function public.set_updated_at();

create or replace function public.reorder_media_entries(
  p_media_type text,
  p_entry_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  expected_count integer;
  actual_count integer;
begin
  expected_count := coalesce(array_length(p_entry_ids, 1), 0);
  select count(*) into actual_count
  from public.media_entries
  where id = any(p_entry_ids)
    and media_type = p_media_type;

  if expected_count = 0 or expected_count <> actual_count then
    raise exception '排序列表包含不存在或分类不一致的影视条目';
  end if;

  update public.media_entries as entry
  set sort_order = ordered.position * 1000,
      updated_at = now()
  from unnest(p_entry_ids) with ordinality as ordered(id, position)
  where entry.id = ordered.id
    and entry.media_type = p_media_type;
end;
$$;

alter table public.media_entries enable row level security;
alter table public.activity_items enable row level security;
alter table public.luggage_scenes enable row level security;
alter table public.luggage_groups enable row level security;
alter table public.luggage_items enable row level security;
alter table public.dining_places enable row level security;

grant select, insert, update, delete
on table
  public.media_entries,
  public.activity_items,
  public.luggage_scenes,
  public.luggage_groups,
  public.luggage_items,
  public.dining_places
to service_role;

revoke all on function public.reorder_media_entries(text, uuid[])
from public, anon, authenticated;
grant execute on function public.reorder_media_entries(text, uuid[])
to service_role;
