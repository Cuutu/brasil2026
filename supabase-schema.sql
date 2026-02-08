-- Ejecutá este SQL en Supabase: SQL Editor → New query → pegar y Run
-- La app usa SUPABASE_SERVICE_ROLE_KEY en el servidor, así que solo la API puede leer/escribir.

create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount_brl numeric not null,
  paid_by uuid not null,
  category text not null default 'general',
  created_at timestamptz default now()
);

create table if not exists important_items (
  id uuid primary key default gen_random_uuid(),
  link text default '',
  information text not null,
  amount_brl numeric,
  added_by uuid,
  created_at timestamptz default now()
);
