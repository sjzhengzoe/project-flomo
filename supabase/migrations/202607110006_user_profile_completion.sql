alter table public.app_users
add column if not exists profile_completed boolean;

update public.app_users
set profile_completed = true
where profile_completed is null;

alter table public.app_users
alter column profile_completed set default true;

alter table public.app_users
alter column profile_completed set not null;
