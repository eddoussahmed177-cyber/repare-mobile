-- Données de démonstration du catalogue Répare Mobile.
-- À exécuter après supabase-setup.sql et supabase-orders.sql.
-- Les montants sont des estimations en DT à valider par l'atelier après diagnostic.
-- Ce seed ne crée aucun compte et n'attribue aucun rôle admin.
-- ON CONFLICT DO NOTHING permet de le relancer sans écraser les tarifs modifiés.

-- Crée le catalogue s'il manque (par exemple si l'ancien setup a été exécuté).
create table if not exists public.repair_services (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (length(trim(brand)) between 1 and 80),
  model text not null check (length(trim(model)) between 1 and 120),
  repair_type text not null check (length(trim(repair_type)) between 1 and 160),
  estimate_price numeric(10,2) check (estimate_price is null or estimate_price >= 0),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (brand, model, repair_type)
);

alter table public.repair_services enable row level security;
revoke all on public.repair_services from anon, authenticated;
grant select on public.repair_services to anon, authenticated;
grant insert, update, delete on public.repair_services to authenticated;

create or replace function public.is_repair_admin()
returns boolean
language sql stable security definer set search_path = ''
as $function$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  );
$function$;
revoke all on function public.is_repair_admin() from public;
grant execute on function public.is_repair_admin() to anon, authenticated;

drop policy if exists repair_services_read_active on public.repair_services;
create policy repair_services_read_active on public.repair_services
  for select to anon, authenticated
  using (active or (select public.is_repair_admin()));
drop policy if exists repair_services_manage_admin on public.repair_services;
create policy repair_services_manage_admin on public.repair_services
  for all to authenticated
  using ((select public.is_repair_admin()))
  with check ((select public.is_repair_admin()));

insert into public.repair_services (brand, model, repair_type, estimate_price)
values
  ('Apple', 'iPhone 11', 'Écran', 250),
  ('Apple', 'iPhone 11', 'Batterie', 100),
  ('Apple', 'iPhone 11', 'Charge', 60),
  ('Apple', 'iPhone 12', 'Écran', 300),
  ('Apple', 'iPhone 12', 'Batterie', 120),
  ('Apple', 'iPhone 12', 'Charge', 70),
  ('Apple', 'iPhone 13', 'Écran', 360),
  ('Apple', 'iPhone 13', 'Batterie', 140),
  ('Apple', 'iPhone 13', 'Charge', 80),
  ('Apple', 'iPhone 14', 'Écran', 420),
  ('Apple', 'iPhone 14', 'Batterie', 160),
  ('Apple', 'iPhone 14', 'Charge', 90),
  ('Apple', 'iPhone 15', 'Écran', 500),
  ('Apple', 'iPhone 15', 'Batterie', 190),
  ('Apple', 'iPhone 15', 'Charge', 100),
  ('Samsung', 'Galaxy A14', 'Écran', 90),
  ('Samsung', 'Galaxy A14', 'Batterie', 70),
  ('Samsung', 'Galaxy A14', 'Charge', 40),
  ('Samsung', 'Galaxy A15', 'Écran', 110),
  ('Samsung', 'Galaxy A15', 'Batterie', 80),
  ('Samsung', 'Galaxy A15', 'Charge', 45),
  ('Samsung', 'Galaxy A24', 'Écran', 140),
  ('Samsung', 'Galaxy A24', 'Batterie', 85),
  ('Samsung', 'Galaxy A24', 'Charge', 50),
  ('Samsung', 'Galaxy A34', 'Écran', 220),
  ('Samsung', 'Galaxy A34', 'Batterie', 100),
  ('Samsung', 'Galaxy A34', 'Charge', 60),
  ('Samsung', 'Galaxy A54', 'Écran', 280),
  ('Samsung', 'Galaxy A54', 'Batterie', 120),
  ('Samsung', 'Galaxy A54', 'Charge', 65),
  ('Xiaomi', 'Redmi Note 12', 'Écran', 150),
  ('Xiaomi', 'Redmi Note 12', 'Batterie', 80),
  ('Xiaomi', 'Redmi Note 12', 'Charge', 45),
  ('Xiaomi', 'Redmi Note 13', 'Écran', 180),
  ('Xiaomi', 'Redmi Note 13', 'Batterie', 90),
  ('Xiaomi', 'Redmi Note 13', 'Charge', 50),
  ('Xiaomi', 'Redmi 12', 'Écran', 120),
  ('Xiaomi', 'Redmi 12', 'Batterie', 75),
  ('Xiaomi', 'Redmi 12', 'Charge', 40),
  ('POCO', 'POCO X5', 'Écran', 180),
  ('POCO', 'POCO X5', 'Batterie', 90),
  ('POCO', 'POCO X5', 'Charge', 50),
  ('Huawei', 'P30', 'Écran', 240),
  ('Huawei', 'P30', 'Batterie', 110),
  ('Huawei', 'P30', 'Charge', 60),
  ('OPPO', 'A78', 'Écran', 150),
  ('OPPO', 'A78', 'Batterie', 80),
  ('OPPO', 'A78', 'Charge', 45),
  ('Google Pixel', 'Pixel 7', 'Écran', 330),
  ('Google Pixel', 'Pixel 7', 'Batterie', 150),
  ('Google Pixel', 'Pixel 7', 'Charge', 80)
on conflict (brand, model, repair_type) do nothing;
