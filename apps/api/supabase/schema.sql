-- ============================================================
-- OfferPilot — Supabase schema
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Security model: the browser uses the public "anon" key, so the
-- anon role may only INSERT. It can never read, change or delete
-- rows — you read submissions in the Supabase dashboard (Table
-- Editor) or with the service-role key on a server.
-- ============================================================

create table if not exists public.signups (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null check (char_length(name) between 1 and 120),
  email          text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  university     text check (char_length(university) <= 160),
  location       text check (char_length(location) <= 120),
  visa           text check (char_length(visa) <= 40),
  opt_expiry     date,
  target_roles   text[] not null default '{}',
  skills         text[] not null default '{}',
  plan           text not null check (plan in ('Starter', 'Pro', 'Elite')),
  billing        text not null check (billing in ('monthly', 'annual')),
  promo_code     text check (char_length(promo_code) <= 32),
  first_payment  numeric(10, 2) check (first_payment >= 0),
  referral_code  text check (char_length(referral_code) <= 32),
  referred_by    text check (char_length(referred_by) <= 32)
);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  source      text not null default 'contact' check (source in ('contact', 'chat')),
  name        text check (char_length(name) <= 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  topic       text check (char_length(topic) <= 80),
  message     text not null check (char_length(message) between 1 and 5000)
);

alter table public.signups  enable row level security;
alter table public.messages enable row level security;

-- Insert-only for the public site. No select/update/delete policies exist,
-- so those are denied for anon by default.
drop policy if exists "site can insert signups" on public.signups;
create policy "site can insert signups" on public.signups
  for insert to anon with check (true);

drop policy if exists "site can insert messages" on public.messages;
create policy "site can insert messages" on public.messages
  for insert to anon with check (true);

-- Newest first in the dashboard.
create index if not exists signups_created_at_idx  on public.signups  (created_at desc);
create index if not exists messages_created_at_idx on public.messages (created_at desc);
