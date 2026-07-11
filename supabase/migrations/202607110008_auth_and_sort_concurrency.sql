-- Existing users were deliberately grandfathered by migration 006. New rows
-- must opt in to completion explicitly so a future insert cannot bypass setup.
alter table public.app_users
alter column profile_completed set default false;

-- All media ordering mutations share one scope lock. The lists are small, and
-- a single lock avoids category-move lock inversions while keeping operations
-- deterministic.
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
    hashtextextended('public.media_entries:sort_order', 0)
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
  perform pg_advisory_xact_lock(
    hashtextextended('public.media_entries:sort_order', 0)
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
  locked_count integer;
  updated_requested_count integer;
begin
  expected_count := coalesce(array_length(p_dish_ids, 1), 0);
  if expected_count = 0 then
    raise exception using
      errcode = '22023',
      message = '排序列表不能为空';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('public.dishes:sort_order', 0)
  );

  perform id
  from public.dishes
  where id = any(p_dish_ids)
  order by id
  for update;
  get diagnostics locked_count = row_count;

  if locked_count <> expected_count then
    raise exception using
      errcode = '22023',
      message = '排序列表包含不存在的菜品';
  end if;

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
  ), updated as (
    update public.dishes as dish
    set sort_order = desired.position * 1000
    from desired
    where dish.id = desired.id
    returning dish.id
  )
  select count(*) filter (where updated.id = any(p_dish_ids))::integer
  into updated_requested_count
  from updated;

  if updated_requested_count <> expected_count then
    raise exception using
      errcode = '22023',
      message = '部分菜品未能完成排序';
  end if;
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
  locked_count integer;
  updated_requested_count integer;
begin
  expected_count := coalesce(array_length(p_entry_ids, 1), 0);
  if expected_count = 0 then
    raise exception using
      errcode = '22023',
      message = '排序列表不能为空';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('public.media_entries:sort_order', 0)
  );

  perform id
  from public.media_entries
  where id = any(p_entry_ids)
    and media_type = p_media_type
  order by id
  for update;
  get diagnostics locked_count = row_count;

  if locked_count <> expected_count then
    raise exception using
      errcode = '22023',
      message = '排序列表包含不存在或分类不一致的影视条目';
  end if;

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
  ), updated as (
    update public.media_entries as entry
    set sort_order = desired.position * 1000
    from desired
    where entry.id = desired.id
      and entry.media_type = p_media_type
    returning entry.id
  )
  select count(*) filter (where updated.id = any(p_entry_ids))::integer
  into updated_requested_count
  from updated;

  if updated_requested_count <> expected_count then
    raise exception using
      errcode = '22023',
      message = '部分影视条目未能完成排序';
  end if;
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

  perform pg_advisory_xact_lock(
    hashtextextended('public.dishes:sort_order', 0)
  );

  perform id
  from public.dishes
  where id = any(array[p_source_id, p_target_id])
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
  where id = any(array[p_source_id, p_target_id]);
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

  perform pg_advisory_xact_lock(
    hashtextextended('public.media_entries:sort_order', 0)
  );

  perform id
  from public.media_entries
  where id = any(array[p_source_id, p_target_id])
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
  where id = any(array[p_source_id, p_target_id]);
end;
$$;
