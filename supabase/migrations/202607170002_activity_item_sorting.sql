create or replace function public.swap_activity_item_sort_orders(
  p_source_id uuid,
  p_target_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  source_order bigint;
  target_order bigint;
  source_type text;
  target_type text;
  locked_count integer;
begin
  if p_source_id is null or p_target_id is null or p_source_id = p_target_id then
    raise exception using errcode = '22023', message = '请选择两个不同的活动项目';
  end if;

  perform id from public.activity_items
  where id = any(array[p_source_id, p_target_id])
  order by id for update;
  get diagnostics locked_count = row_count;
  if locked_count <> 2 then
    raise exception using errcode = 'P0002', message = '活动项目不存在';
  end if;

  select sort_order, activity_type into source_order, source_type from public.activity_items where id = p_source_id;
  select sort_order, activity_type into target_order, target_type from public.activity_items where id = p_target_id;
  if source_type <> target_type then
    raise exception using errcode = '22023', message = '只能交换同一分类下的活动';
  end if;

  update public.activity_items
  set sort_order = case id when p_source_id then target_order when p_target_id then source_order end
  where id = any(array[p_source_id, p_target_id]);
end;
$$;

revoke all on function public.swap_activity_item_sort_orders(uuid, uuid) from public, anon, authenticated;
grant execute on function public.swap_activity_item_sort_orders(uuid, uuid) to service_role;
