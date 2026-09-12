-- Run in the Supabase SQL editor if categories.color is missing.
alter table public.categories
  add column if not exists color text;

comment on column public.categories.icon is 'Board icon id (e.g. folder, lightbulb)';
comment on column public.categories.color is 'Board color id (e.g. violet, blue, emerald)';
