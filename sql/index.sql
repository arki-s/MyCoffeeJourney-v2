create index if not exists idx_brands_user_created_desc
on public.coffee_brands (user_id, created_at desc);

create index if not exists idx_beans_user_created_desc
on public.coffee_beans (user_id, created_at desc);
