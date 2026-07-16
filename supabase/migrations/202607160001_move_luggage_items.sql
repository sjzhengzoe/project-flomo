create or replace function public.move_luggage_item(
  p_source_id uuid,
  p_target_group_id uuid,
  p_target_item_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_group_id uuid;
  v_source_scene_id uuid;
  v_target_scene_id uuid;
  v_insert_at integer;
begin
  perform pg_advisory_xact_lock(hashtext('move_luggage_item'));

  select i.group_id, g.scene_id
    into v_source_group_id, v_source_scene_id
  from public.luggage_items i
  join public.luggage_groups g on g.id = i.group_id
  where i.id = p_source_id
  for update of i;

  if v_source_group_id is null then
    raise exception using errcode = 'P0002', message = '行李物品不存在。';
  end if;

  select scene_id into v_target_scene_id
  from public.luggage_groups
  where id = p_target_group_id;

  if v_target_scene_id is null then
    raise exception using errcode = 'P0002', message = '目标行李层级不存在。';
  end if;
  if v_target_scene_id <> v_source_scene_id then
    raise exception using errcode = '23514', message = '物品只能在同一场景的层级间移动。';
  end if;
  if p_target_item_id = p_source_id then
    return;
  end if;
  if p_target_item_id is not null and not exists (
    select 1 from public.luggage_items
    where id = p_target_item_id and group_id = p_target_group_id
  ) then
    raise exception using errcode = '23514', message = '目标物品不在目标层级中。';
  end if;

  update public.luggage_items
  set sort_order = sort_order - 1
  where group_id = v_source_group_id
    and id <> p_source_id
    and sort_order > (select sort_order from public.luggage_items where id = p_source_id);

  if p_target_item_id is null then
    select coalesce(max(sort_order) + 1, 0) into v_insert_at
    from public.luggage_items
    where group_id = p_target_group_id and id <> p_source_id;
  else
    select sort_order into v_insert_at
    from public.luggage_items where id = p_target_item_id;
  end if;

  update public.luggage_items
  set sort_order = sort_order + 1
  where group_id = p_target_group_id
    and id <> p_source_id
    and sort_order >= v_insert_at;

  update public.luggage_items
  set group_id = p_target_group_id, sort_order = v_insert_at
  where id = p_source_id;
end;
$$;

revoke all on function public.move_luggage_item(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.move_luggage_item(uuid, uuid, uuid) to service_role;
