update public.media_entries as entry
set platforms = array(
  select allowed.platform
  from (
    select candidate.platform, min(candidate.position) as first_position
    from unnest(entry.platforms) with ordinality as candidate(platform, position)
    where candidate.platform = any (
      array['腾讯视频', '爱奇艺', '哔哩哔哩', '夸克', '优酷', '芒果 TV']::text[]
    )
    group by candidate.platform
  ) as allowed
  order by allowed.first_position
)
where not (
  entry.platforms <@ array['腾讯视频', '爱奇艺', '哔哩哔哩', '夸克', '优酷', '芒果 TV']::text[]
);

alter table public.media_entries
drop constraint if exists media_entries_platforms_valid;

alter table public.media_entries
add constraint media_entries_platforms_valid check (
  platforms <@ array['腾讯视频', '爱奇艺', '哔哩哔哩', '夸克', '优酷', '芒果 TV']::text[]
);

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

  update public.media_entries
  set sort_order = case id
    when p_source_id then target_order
    when p_target_id then source_order
  end
  where id = any (array[p_source_id, p_target_id]);
end;
$$;

revoke all on function public.swap_dish_sort_orders(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.swap_dish_sort_orders(uuid, uuid)
to service_role;

revoke all on function public.swap_media_entry_sort_orders(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.swap_media_entry_sort_orders(uuid, uuid)
to service_role;
