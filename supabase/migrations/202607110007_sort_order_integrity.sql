-- The constraint changes below require ACCESS EXCLUSIVE. Acquire the final
-- lock level up front so deployment cannot deadlock while upgrading its lock.
lock table public.dishes, public.media_entries in access exclusive mode;

-- Preserve the current visible order while repairing historical duplicate positions.
with ranked as (
  select
    id,
    row_number() over (
      order by sort_order asc, created_at desc, id
    )::bigint * 1000 as normalized_sort_order
  from public.dishes
)
update public.dishes as dish
set sort_order = ranked.normalized_sort_order
from ranked
where dish.id = ranked.id
  and dish.sort_order <> ranked.normalized_sort_order;

with ranked as (
  select
    id,
    row_number() over (
      partition by media_type
      order by sort_order asc, created_at desc, id
    )::bigint * 1000 as normalized_sort_order
  from public.media_entries
)
update public.media_entries as entry
set sort_order = ranked.normalized_sort_order
from ranked
where entry.id = ranked.id
  and entry.sort_order <> ranked.normalized_sort_order;

-- Keep only supported platforms and remove historical duplicates without changing
-- the first-seen order.
with normalized as (
  select
    entry.id,
    array(
      select candidate.platform
      from unnest(entry.platforms) with ordinality as candidate(platform, position)
      where candidate.platform = any (
        array['腾讯视频', '爱奇艺', '哔哩哔哩', '夸克', '优酷', '芒果 TV']::text[]
      )
      group by candidate.platform
      order by min(candidate.position)
    ) as platforms
  from public.media_entries as entry
)
update public.media_entries as entry
set platforms = normalized.platforms
from normalized
where entry.id = normalized.id
  and entry.platforms is distinct from normalized.platforms;

create or replace function public.text_array_has_unique_values(p_values text[])
returns boolean
language sql
immutable
parallel safe
set search_path = pg_catalog
as $$
  select cardinality(p_values) = count(distinct item.value)
  from unnest(p_values) as item(value);
$$;

alter table public.media_entries
drop constraint if exists media_entries_platforms_valid;

alter table public.media_entries
add constraint media_entries_platforms_valid check (
  platforms <@ array['腾讯视频', '爱奇艺', '哔哩哔哩', '夸克', '优酷', '芒果 TV']::text[]
  and public.text_array_has_unique_values(platforms)
);

alter table public.dishes
drop constraint if exists dishes_sort_order_unique;

alter table public.dishes
add constraint dishes_sort_order_unique
unique (sort_order)
deferrable initially immediate;

alter table public.media_entries
drop constraint if exists media_entries_type_sort_order_unique;

alter table public.media_entries
add constraint media_entries_type_sort_order_unique
unique (media_type, sort_order)
deferrable initially immediate;

-- The advisory locks cover the max lookup and insert in the same transaction.
-- Therefore concurrent creates in the same ordering scope cannot reserve one value.
create or replace function public.create_dish_at_end(
  p_id uuid,
  p_name text,
  p_category_id uuid,
  p_image_path text,
  p_thumbnail_path text
)
returns setof public.dishes
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_order bigint;
begin
  perform pg_advisory_xact_lock(
    hashtextextended('public.dishes:sort_order', 0)
  );

  select coalesce(max(sort_order), 0) + 1000
  into next_order
  from public.dishes;

  return query
  insert into public.dishes (
    id,
    name,
    category_id,
    image_path,
    thumbnail_path,
    sort_order
  )
  values (
    p_id,
    p_name,
    p_category_id,
    p_image_path,
    p_thumbnail_path,
    next_order
  )
  returning *;
end;
$$;

create or replace function public.create_media_entry_at_end(
  p_title text,
  p_media_type text,
  p_watch_status text,
  p_platforms text[]
)
returns setof public.media_entries
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_order bigint;
begin
  perform pg_advisory_xact_lock(
    hashtextextended('public.media_entries:sort_order:' || p_media_type, 0)
  );

  select coalesce(max(sort_order), 0) + 1000
  into next_order
  from public.media_entries
  where media_type = p_media_type;

  return query
  insert into public.media_entries (
    title,
    media_type,
    watch_status,
    platforms,
    sort_order
  )
  values (
    p_title,
    p_media_type,
    p_watch_status,
    p_platforms,
    next_order
  )
  returning *;
end;
$$;

create or replace function public.move_media_entry_to_type_at_end(
  p_entry_id uuid,
  p_title text,
  p_media_type text,
  p_watch_status text,
  p_platforms text[]
)
returns setof public.media_entries
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_media_type text;
  next_order bigint;
begin
  -- Take the destination lock before the row lock. Creates, moves, and reorders
  -- in one media type therefore share a consistent lock order.
  perform pg_advisory_xact_lock(
    hashtextextended('public.media_entries:sort_order:' || p_media_type, 0)
  );

  select entry.media_type
  into current_media_type
  from public.media_entries as entry
  where entry.id = p_entry_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = '影视条目不存在';
  end if;

  if current_media_type = p_media_type then
    return query
    update public.media_entries as entry
    set title = coalesce(p_title, entry.title),
        watch_status = coalesce(p_watch_status, entry.watch_status),
        platforms = coalesce(p_platforms, entry.platforms)
    where entry.id = p_entry_id
    returning entry.*;
    return;
  end if;

  select coalesce(max(entry.sort_order), 0) + 1000
  into next_order
  from public.media_entries as entry
  where entry.media_type = p_media_type;

  return query
  update public.media_entries as entry
  set title = coalesce(p_title, entry.title),
      media_type = p_media_type,
      watch_status = coalesce(p_watch_status, entry.watch_status),
      platforms = coalesce(p_platforms, entry.platforms),
      sort_order = next_order
  where entry.id = p_entry_id
  returning entry.*;
end;
$$;

create or replace function public.reorder_dishes(p_dish_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  expected_count integer;
  actual_count integer;
begin
  expected_count := coalesce(array_length(p_dish_ids, 1), 0);

  select count(*) into actual_count
  from public.dishes
  where id = any(p_dish_ids);

  if expected_count = 0 or expected_count <> actual_count then
    raise exception using
      errcode = '22023',
      message = '排序列表包含不存在的菜品';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('public.dishes:sort_order', 0)
  );
  set constraints dishes_sort_order_unique deferred;

  with requested as (
    select ordered.id, ordered.position::bigint as position
    from unnest(p_dish_ids) with ordinality as ordered(id, position)
  ), remaining as (
    select
      dish.id,
      expected_count::bigint + row_number() over (
        order by dish.sort_order asc, dish.created_at desc, dish.id
      )::bigint as position
    from public.dishes as dish
    where not (dish.id = any(p_dish_ids))
  ), desired as (
    select id, position from requested
    union all
    select id, position from remaining
  )
  update public.dishes as dish
  set sort_order = desired.position * 1000
  from desired
  where dish.id = desired.id;
end;
$$;

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
    raise exception using
      errcode = '22023',
      message = '排序列表包含不存在或分类不一致的影视条目';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('public.media_entries:sort_order:' || p_media_type, 0)
  );
  set constraints media_entries_type_sort_order_unique deferred;

  with requested as (
    select ordered.id, ordered.position::bigint as position
    from unnest(p_entry_ids) with ordinality as ordered(id, position)
  ), remaining as (
    select
      entry.id,
      expected_count::bigint + row_number() over (
        order by entry.sort_order asc, entry.created_at desc, entry.id
      )::bigint as position
    from public.media_entries as entry
    where entry.media_type = p_media_type
      and not (entry.id = any(p_entry_ids))
  ), desired as (
    select id, position from requested
    union all
    select id, position from remaining
  )
  update public.media_entries as entry
  set sort_order = desired.position * 1000
  from desired
  where entry.id = desired.id
    and entry.media_type = p_media_type;
end;
$$;

create or replace function public.swap_dish_sort_orders(
  p_source_id uuid,
  p_target_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  source_order bigint;
  target_order bigint;
  locked_count integer;
begin
  if p_source_id is null or p_target_id is null or p_source_id = p_target_id then
    raise exception using
      errcode = '22023',
      message = '请选择两个不同的菜品交换位置';
  end if;

  perform id
  from public.dishes
  where id = any (array[p_source_id, p_target_id])
  order by id
  for update;
  get diagnostics locked_count = row_count;

  if locked_count <> 2 then
    raise exception using
      errcode = 'P0002',
      message = '交换位置的菜品不存在';
  end if;

  select sort_order into source_order
  from public.dishes
  where id = p_source_id;

  select sort_order into target_order
  from public.dishes
  where id = p_target_id;

  set constraints dishes_sort_order_unique deferred;

  update public.dishes
  set sort_order = case id
    when p_source_id then target_order
    when p_target_id then source_order
  end
  where id = any (array[p_source_id, p_target_id]);
end;
$$;

create or replace function public.swap_media_entry_sort_orders(
  p_source_id uuid,
  p_target_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  source_order bigint;
  target_order bigint;
  source_media_type text;
  target_media_type text;
  locked_count integer;
begin
  if p_source_id is null or p_target_id is null or p_source_id = p_target_id then
    raise exception using
      errcode = '22023',
      message = '请选择两个不同的影视条目交换位置';
  end if;

  perform id
  from public.media_entries
  where id = any (array[p_source_id, p_target_id])
  order by id
  for update;
  get diagnostics locked_count = row_count;

  if locked_count <> 2 then
    raise exception using
      errcode = 'P0002',
      message = '交换位置的影视条目不存在';
  end if;

  select sort_order, media_type into source_order, source_media_type
  from public.media_entries
  where id = p_source_id;

  select sort_order, media_type into target_order, target_media_type
  from public.media_entries
  where id = p_target_id;

  if source_media_type <> target_media_type then
    raise exception using
      errcode = '22023',
      message = '只能交换同一分类下的影视条目';
  end if;

  set constraints media_entries_type_sort_order_unique deferred;

  update public.media_entries
  set sort_order = case id
    when p_source_id then target_order
    when p_target_id then source_order
  end
  where id = any (array[p_source_id, p_target_id]);
end;
$$;

revoke all on function public.text_array_has_unique_values(text[])
from public, anon, authenticated;
grant execute on function public.text_array_has_unique_values(text[])
to service_role;

revoke all on function public.create_dish_at_end(uuid, text, uuid, text, text)
from public, anon, authenticated;
grant execute on function public.create_dish_at_end(uuid, text, uuid, text, text)
to service_role;

revoke all on function public.create_media_entry_at_end(text, text, text, text[])
from public, anon, authenticated;
grant execute on function public.create_media_entry_at_end(text, text, text, text[])
to service_role;

revoke all on function public.move_media_entry_to_type_at_end(uuid, text, text, text, text[])
from public, anon, authenticated;
grant execute on function public.move_media_entry_to_type_at_end(uuid, text, text, text, text[])
to service_role;

revoke all on function public.reorder_dishes(uuid[])
from public, anon, authenticated;
grant execute on function public.reorder_dishes(uuid[])
to service_role;

revoke all on function public.reorder_media_entries(text, uuid[])
from public, anon, authenticated;
grant execute on function public.reorder_media_entries(text, uuid[])
to service_role;

revoke all on function public.swap_dish_sort_orders(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.swap_dish_sort_orders(uuid, uuid)
to service_role;

revoke all on function public.swap_media_entry_sort_orders(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.swap_media_entry_sort_orders(uuid, uuid)
to service_role;
