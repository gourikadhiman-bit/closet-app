create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Untitled item',
  brand text not null default '',
  category text not null check (
    category in ('Top', 'Bottom', 'Dress', 'Shoes', 'Accessory', 'Other')
  ),
  
  size text not null default '',
  notes text not null default '',
  image_url text not null check (length(trim(image_url)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists clothing_items_user_id_idx
on public.clothing_items (user_id);

alter table public.clothing_items enable row level security;

revoke all on table public.clothing_items from anon;
grant select, insert, update, delete on table public.clothing_items to authenticated;

drop policy if exists "Users can view their own clothing items" on public.clothing_items;
create policy "Users can view their own clothing items"
on public.clothing_items
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own clothing items" on public.clothing_items;
create policy "Users can create their own clothing items"
on public.clothing_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own clothing items" on public.clothing_items;
create policy "Users can update their own clothing items"
on public.clothing_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own clothing items" on public.clothing_items;
create policy "Users can delete their own clothing items"
on public.clothing_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username = lower(username)
    and username ~ '^[a-z0-9_]{3,30}$'
  )
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Private image bucket. Run this section in the Supabase SQL Editor even if the
-- clothing_items table already exists.
insert into storage.buckets (id, name, public)
values ('clothing-images', 'clothing-images', false)
on conflict (id) do update
set public = false;

drop policy if exists "Users can read their own clothing images" on storage.objects;
create policy "Users can read their own clothing images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
);

drop policy if exists "Users can upload their own clothing images" on storage.objects;
create policy "Users can upload their own clothing images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can update their own clothing images" on storage.objects;
create policy "Users can update their own clothing images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
);

drop policy if exists "Users can delete their own clothing images" on storage.objects;
create policy "Users can delete their own clothing images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'clothing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
);
