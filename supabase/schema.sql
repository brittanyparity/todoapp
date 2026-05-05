-- Todo app: tasks per authenticated user (Supabase Auth + RLS).
-- Run this entire file in the Supabase SQL Editor (Dashboard → SQL → New query → Run).

-- ---------------------------------------------------------------------------
-- Table: public.tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_length check (
    char_length(trim(title)) > 0
    and char_length(title) <= 500
  )
);

comment on table public.tasks is 'Per-user todo items; access controlled by RLS.';

create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

-- Keep updated_at in sync on every update
create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_tasks_updated_at();

-- Force user_id from the session so clients cannot assign rows to other users
create or replace function public.tasks_set_user_id()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists tasks_set_user_id on public.tasks;
create trigger tasks_set_user_id
  before insert on public.tasks
  for each row
  execute function public.tasks_set_user_id();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.tasks enable row level security;

alter table public.tasks force row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.tasks to authenticated;
