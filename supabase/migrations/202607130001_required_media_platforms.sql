alter table public.media_entries
drop constraint if exists media_entries_platforms_valid;

update public.media_entries
set platforms = array['待定']::text[]
where cardinality(platforms) = 0;

alter table public.media_entries
alter column platforms set default array['待定']::text[];

alter table public.media_entries
add constraint media_entries_platforms_valid check (
  cardinality(platforms) > 0
  and platforms <@ array[
    '待定', '腾讯视频', '爱奇艺', '哔哩哔哩', '夸克', '优酷', '芒果 TV', '猫耳', '漫播'
  ]::text[]
  and public.text_array_has_unique_values(platforms)
  and (not ('待定' = any(platforms)) or cardinality(platforms) = 1)
);
