create table if not exists public.dining_scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40),
  sort_order bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dining_scenes_sort_order_unique unique (sort_order) deferrable initially immediate
);

insert into public.dining_scenes (name, sort_order) values ('日常', 1000) on conflict (name) do nothing;
alter table public.dining_places add column if not exists scene_id uuid;
update public.dining_places set scene_id = (select id from public.dining_scenes where name = '日常') where scene_id is null;
alter table public.dining_places alter column scene_id set not null;
alter table public.dining_places drop constraint if exists dining_places_scene_id_fkey;
alter table public.dining_places add constraint dining_places_scene_id_fkey foreign key (scene_id) references public.dining_scenes(id) on delete restrict;
create index if not exists dining_places_scene_sort_idx on public.dining_places(scene_id, sort_order);

drop trigger if exists dining_scenes_set_updated_at on public.dining_scenes;
create trigger dining_scenes_set_updated_at before update on public.dining_scenes for each row execute function public.set_updated_at();

create or replace function public.create_dining_scene_at_end(p_name text) returns setof public.dining_scenes language plpgsql security definer set search_path = public as $$
declare next_order bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('public.dining_scenes:sort_order', 0));
  select coalesce(max(sort_order), 0) + 1000 into next_order from public.dining_scenes;
  return query insert into public.dining_scenes (name, sort_order) values (p_name, next_order) returning *;
end; $$;

create or replace function public.swap_dining_scene_sort_orders(p_source_id uuid, p_target_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare source_order bigint; target_order bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('public.dining_scenes:sort_order', 0));
  select sort_order into source_order from public.dining_scenes where id = p_source_id;
  select sort_order into target_order from public.dining_scenes where id = p_target_id;
  if source_order is null or target_order is null then raise exception using errcode = 'P0002', message = '用餐场景不存在'; end if;
  set constraints dining_scenes_sort_order_unique deferred;
  update public.dining_scenes set sort_order = case id when p_source_id then target_order when p_target_id then source_order end where id in (p_source_id, p_target_id);
end; $$;

alter table public.dining_scenes enable row level security;
revoke all on public.dining_scenes from anon, authenticated;
grant select, insert, update, delete on table public.dining_scenes to service_role;
revoke all on function public.create_dining_scene_at_end(text) from public, anon, authenticated;
revoke all on function public.swap_dining_scene_sort_orders(uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_dining_scene_at_end(text) to service_role;
grant execute on function public.swap_dining_scene_sort_orders(uuid, uuid) to service_role;
