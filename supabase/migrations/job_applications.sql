-- ─────────────────────────────────────────────────────────
-- Job Applications table for ApplyReady tracker
-- Run this in your Supabase SQL editor:
--   https://app.supabase.com → SQL Editor → New query
-- ─────────────────────────────────────────────────────────

create table if not exists public.job_applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  company       text not null,
  role          text not null,
  status        text not null default 'applied'
                  check (status in ('applied', 'interviewing', 'offer', 'rejected')),
  date_applied  date not null default current_date,
  location      text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row level security
alter table public.job_applications enable row level security;

-- Users can only see their own applications
create policy "Users can view their own applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

-- Users can insert their own applications
create policy "Users can insert their own applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

-- Users can update their own applications
create policy "Users can update their own applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

-- Users can delete their own applications
create policy "Users can delete their own applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- Index for faster user queries
create index if not exists job_applications_user_id_idx
  on public.job_applications(user_id, created_at desc);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.update_updated_at();
