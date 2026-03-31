-- Stickify Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (synced from auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text not null,
  icon text,
  position integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, slug)
);

alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can create own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Create post type enum
create type public.post_type as enum ('text', 'code', 'link');

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade not null,
  type public.post_type not null default 'text',
  title text not null,
  content_text text,
  content_code text,
  code_language text,
  url text,
  preview_title text,
  preview_description text,
  preview_image text,
  preview_favicon text,
  preview_domain text,
  color text,
  is_pinned boolean default false not null,
  is_archived boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "Users can view own posts"
  on public.posts for select
  using (auth.uid() = user_id);

create policy "Users can create own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Tags table
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null,
  unique(user_id, name)
);

alter table public.tags enable row level security;

create policy "Users can view own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can create own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own tags"
  on public.tags for delete
  using (auth.uid() = user_id);

-- Post-Tags junction table
create table public.post_tags (
  post_id uuid references public.posts on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  primary key (post_id, tag_id)
);

alter table public.post_tags enable row level security;

create policy "Users can view own post_tags"
  on public.post_tags for select
  using (
    exists (
      select 1 from public.posts
      where posts.id = post_tags.post_id
      and posts.user_id = auth.uid()
    )
  );

create policy "Users can create own post_tags"
  on public.post_tags for insert
  with check (
    exists (
      select 1 from public.posts
      where posts.id = post_tags.post_id
      and posts.user_id = auth.uid()
    )
  );

create policy "Users can delete own post_tags"
  on public.post_tags for delete
  using (
    exists (
      select 1 from public.posts
      where posts.id = post_tags.post_id
      and posts.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index idx_categories_user_id on public.categories(user_id);
create index idx_categories_position on public.categories(user_id, position);
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_category_id on public.posts(category_id);
create index idx_posts_type on public.posts(type);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_is_pinned on public.posts(is_pinned) where is_pinned = true;
create index idx_tags_user_id on public.tags(user_id);
create index idx_post_tags_post_id on public.post_tags(post_id);
create index idx_post_tags_tag_id on public.post_tags(tag_id);

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_categories_updated_at
  before update on public.categories
  for each row execute procedure public.update_updated_at_column();

create trigger update_posts_updated_at
  before update on public.posts
  for each row execute procedure public.update_updated_at_column();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();
