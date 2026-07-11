grant usage on schema public to service_role;

grant select, insert, update, delete
on table
  public.app_users,
  public.app_sessions,
  public.categories,
  public.dishes
to service_role;

grant execute on function public.reorder_dishes(uuid[]) to service_role;
