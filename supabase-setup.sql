-- Initialisation Supabase, adaptée à l’atelier de réparation.
-- Exécuter dans SQL Editor. Relançable sans supprimer les comptes ou demandes existantes.
create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin'))
);

create table if not exists public.repair_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('RM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users(id) on delete restrict,
  attempt_id uuid not null,
  brand text not null check (length(trim(brand)) between 1 and 80),
  model text not null check (length(trim(model)) between 1 and 120),
  repair_type text not null check (length(trim(repair_type)) between 1 and 160),
  client_name text not null check (length(trim(client_name)) between 1 and 120),
  client_email text not null check (length(trim(client_email)) between 3 and 254),
  client_phone text not null check (length(trim(client_phone)) between 6 and 40),
  cart_items jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new','in_progress','completed','cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, attempt_id)
);

-- Catalogue de réparations (équivalent du catalogue produits du TP).
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
insert into public.repair_services (brand, model, repair_type, estimate_price) values
  ('Apple','iPhone 11','Écran',250), ('Apple','iPhone 11','Batterie',100), ('Apple','iPhone 11','Charge',60),
  ('Samsung','Galaxy A14','Écran',90), ('Samsung','Galaxy A14','Batterie',70), ('Samsung','Galaxy A14','Charge',40)
on conflict (brand, model, repair_type) do nothing;

alter table public.repair_requests add column if not exists cart_items jsonb not null default '[]'::jsonb;
create index if not exists repair_requests_user_created_idx on public.repair_requests (user_id, created_at desc);
create index if not exists repair_requests_status_created_idx on public.repair_requests (status, created_at desc);
alter table public.user_roles enable row level security;
alter table public.repair_requests enable row level security;
alter table public.repair_services enable row level security;
revoke all on public.user_roles from anon, authenticated;
revoke all on public.repair_requests from anon, authenticated;
revoke all on public.repair_services from anon, authenticated;
grant select on public.user_roles to authenticated;
grant select on public.repair_requests to authenticated;
grant update (status) on public.repair_requests to authenticated;
grant select on public.repair_services to anon, authenticated;
grant insert, update, delete on public.repair_services to authenticated;

drop policy if exists user_roles_read_self_or_admin on public.user_roles;
drop policy if exists user_roles_read_self on public.user_roles;
create policy user_roles_read_self on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.is_repair_admin()
returns boolean language sql stable security definer set search_path = ''
as $function$
  select exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin');
$function$;
revoke all on function public.is_repair_admin() from public, anon;
grant execute on function public.is_repair_admin() to authenticated;
grant execute on function public.is_repair_admin() to anon;

drop policy if exists repair_services_read_active on public.repair_services;
create policy repair_services_read_active on public.repair_services for select to anon, authenticated using (active or (select public.is_repair_admin()));
drop policy if exists repair_services_manage_admin on public.repair_services;
create policy repair_services_manage_admin on public.repair_services for all to authenticated using ((select public.is_repair_admin())) with check ((select public.is_repair_admin()));

drop policy if exists repair_requests_read_owner_or_admin on public.repair_requests;
create policy repair_requests_read_owner_or_admin on public.repair_requests for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_repair_admin()));
drop policy if exists repair_requests_update_admin_status on public.repair_requests;
create policy repair_requests_update_admin_status on public.repair_requests for update to authenticated
using ((select public.is_repair_admin())) with check ((select public.is_repair_admin()));

drop function if exists public.create_repair_request(uuid,text,text,text,text,text,text);
create or replace function public.create_repair_request(
  p_attempt_id uuid, p_brand text, p_model text, p_repair_type text,
  p_client_name text, p_client_email text, p_client_phone text, p_cart_items jsonb
)
returns public.repair_requests language plpgsql security definer set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_row public.repair_requests;
begin
  if v_user_id is null then raise exception 'Connexion requise.' using errcode = '28000'; end if;
  if p_attempt_id is null
    or length(trim(coalesce(p_brand, ''))) not between 1 and 80
    or length(trim(coalesce(p_model, ''))) not between 1 and 120
    or length(trim(coalesce(p_repair_type, ''))) not between 1 and 160
    or length(trim(coalesce(p_client_name, ''))) not between 1 and 120
    or length(trim(coalesce(p_client_email, ''))) not between 3 and 254
    or position('@' in p_client_email) < 2
    or length(trim(coalesce(p_client_phone, ''))) not between 6 and 40
  then raise exception 'Informations de demande invalides.' using errcode = '22023'; end if;
  if p_cart_items is null or jsonb_typeof(p_cart_items) <> 'array' then
    raise exception 'Le panier doit être une liste.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_cart_items) not between 1 and 10 then
    raise exception 'Le panier doit contenir entre 1 et 10 lignes.' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_cart_items) as elements(entry)
    where jsonb_typeof(entry) <> 'object'
      or length(trim(coalesce(entry->>'brand', ''))) not between 1 and 80
      or length(trim(coalesce(entry->>'model', ''))) not between 1 and 120
      or length(trim(coalesce(entry->>'repairType', ''))) not between 1 and 160
      or coalesce(entry->>'quantity', '') !~ '^[1-5]$'
  ) then raise exception 'Le contenu du panier est invalide.' using errcode = '22023'; end if;

  -- Le navigateur ne décide jamais du tarif : l'estimation vient du catalogue en base.
  select coalesce(jsonb_agg(jsonb_build_object(
    'brand', trim(e.entry->>'brand'), 'model', trim(e.entry->>'model'),
    'repairType', trim(e.entry->>'repairType'), 'quantity', (e.entry->>'quantity')::integer,
    'price', s.estimate_price
  )), '[]'::jsonb) into p_cart_items
  from jsonb_array_elements(p_cart_items) as e(entry)
  left join public.repair_services s
    on s.brand = trim(e.entry->>'brand') and s.model = trim(e.entry->>'model')
    and s.repair_type = trim(e.entry->>'repairType') and s.active;

  insert into public.repair_requests (user_id, attempt_id, brand, model, repair_type, client_name, client_email, client_phone, cart_items)
  values (v_user_id, p_attempt_id, trim(p_brand), trim(p_model), trim(p_repair_type), trim(p_client_name), lower(trim(p_client_email)), trim(p_client_phone), p_cart_items)
  on conflict (user_id, attempt_id) do nothing returning * into v_row;

  if v_row.id is null then
    select * into v_row from public.repair_requests where user_id = v_user_id and attempt_id = p_attempt_id;
    if v_row.brand is distinct from trim(p_brand)
      or v_row.model is distinct from trim(p_model)
      or v_row.repair_type is distinct from trim(p_repair_type)
      or v_row.client_name is distinct from trim(p_client_name)
      or v_row.client_email is distinct from lower(trim(p_client_email))
      or v_row.client_phone is distinct from trim(p_client_phone)
      or v_row.cart_items is distinct from p_cart_items
    then raise exception 'Cet identifiant de tentative est déjà associé à une autre demande.' using errcode = '22023'; end if;
  end if;
  return v_row;
end;
$function$;
revoke all on function public.create_repair_request(uuid,text,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.create_repair_request(uuid,text,text,text,text,text,text,jsonb) to authenticated;


