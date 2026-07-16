create or replace function public.swap_luggage_group_sort_orders(
  p_source_id uuid,
  p_target_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_scene_id uuid;
  v_target_scene_id uuid;
  v_source_order integer;
  v_target_order integer;
begin
  perform pg_advisory_xact_lock(hashtext('swap_luggage_group_sort_orders'));

  select scene_id, sort_order into v_source_scene_id, v_source_order
  from public.luggage_groups where id = p_source_id for update;
  select scene_id, sort_order into v_target_scene_id, v_target_order
  from public.luggage_groups where id = p_target_id for update;

  if v_source_scene_id is null or v_target_scene_id is null then
    raise exception using errcode = 'P0002', message = '行李层级不存在。';
  end if;
  if v_source_scene_id <> v_target_scene_id then
    raise exception using errcode = '23514', message = '只能调整同一场景内的层级顺序。';
  end if;

  update public.luggage_groups set sort_order = v_target_order where id = p_source_id;
  update public.luggage_groups set sort_order = v_source_order where id = p_target_id;
end;
$$;

revoke all on function public.swap_luggage_group_sort_orders(uuid, uuid) from public, anon, authenticated;
grant execute on function public.swap_luggage_group_sort_orders(uuid, uuid) to service_role;
