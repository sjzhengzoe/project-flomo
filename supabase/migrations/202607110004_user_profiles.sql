alter table public.app_users
add column if not exists avatar_url text not null default '';

alter table public.app_users
drop constraint if exists app_users_display_name_length;
alter table public.app_users
add constraint app_users_display_name_length
check (char_length(display_name) between 1 and 40);

alter table public.app_users
drop constraint if exists app_users_avatar_url_length;
alter table public.app_users
add constraint app_users_avatar_url_length
check (char_length(avatar_url) <= 2048);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-avatars',
  'user-avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
