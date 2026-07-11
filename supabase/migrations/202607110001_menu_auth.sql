create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  wechat_openid text not null unique,
  display_name text not null default '微信用户',
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists app_sessions_user_id_idx on public.app_sessions(user_id);
create index if not exists app_sessions_expires_at_idx on public.app_sessions(expires_at);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  category_id uuid not null references public.categories(id),
  image_path text not null,
  thumbnail_path text,
  printed_at timestamptz,
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dishes_category_id_idx on public.dishes(category_id);
create index if not exists dishes_printed_at_idx on public.dishes(printed_at);
create index if not exists dishes_sort_order_idx on public.dishes(sort_order);
create index if not exists dishes_created_at_idx on public.dishes(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists dishes_set_updated_at on public.dishes;
create trigger dishes_set_updated_at
before update on public.dishes
for each row execute function public.set_updated_at();

insert into public.categories (name, sort_order)
values
  ('荤菜', 1000),
  ('半荤', 2000),
  ('素菜', 3000),
  ('主食', 4000),
  ('水果', 5000),
  ('外食', 6000),
  ('甜品', 7000),
  ('饮品', 8000)
on conflict (name) do update set sort_order = excluded.sort_order;

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
    raise exception '排序列表包含不存在的菜品';
  end if;

  update public.dishes as dish
  set sort_order = ordered.position * 1000,
      updated_at = now()
  from unnest(p_dish_ids) with ordinality as ordered(id, position)
  where dish.id = ordered.id;
end;
$$;

revoke all on function public.reorder_dishes(uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_dishes(uuid[]) to service_role;

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.categories enable row level security;
alter table public.dishes enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dish-images',
  'dish-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
