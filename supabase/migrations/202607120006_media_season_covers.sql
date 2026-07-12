alter table public.media_entries
add column if not exists cover_url text not null default ''
check (char_length(cover_url) <= 1000);

alter table public.media_seasons
add column if not exists cover_url text not null default ''
check (char_length(cover_url) <= 1000);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media-covers',
  'media-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
