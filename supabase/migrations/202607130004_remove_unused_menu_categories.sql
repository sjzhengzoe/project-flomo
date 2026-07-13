delete from public.dishes
where category_id in (
  select id
  from public.categories
  where name in ('水果', '外食', '甜品', '饮品')
);

delete from public.categories
where name in ('水果', '外食', '甜品', '饮品');
