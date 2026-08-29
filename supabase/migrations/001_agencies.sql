-- =============================================================================
-- Captura de agencias — schema para Supabase
-- =============================================================================
-- FASE 1: pega esto en SQL Editor del proyecto personal (padre).
-- FASE 2: el mismo SQL en la base de Nexcar. El código de la app no cambia.
--
-- NO crea la tabla de facturas. Esas viven en documentos analizados
-- (type = 'invoice'). El puente es agency_source_invoices.invoice_id + file_url.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Grupos automotrices
-- -----------------------------------------------------------------------------
create table if not exists automotive_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brands text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table automotive_groups is
  'Grupo automotriz. Una ficha de agencia siempre pertenece a un grupo.';

-- -----------------------------------------------------------------------------
-- Agencias / concesionarias
-- -----------------------------------------------------------------------------
create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references automotive_groups(id) on delete restrict,
  name text not null,
  brand text not null default '',
  legal_name text not null default '',
  rfc text not null default '',
  emitter_number text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  municipality text not null default '',
  state text not null default '',
  postal_code text not null default '',
  location text not null default '',
  notes text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table agencies is
  'Concesionaria. Campos ancla para cruzar facturas: name, rfc, legal_name, dirección.';
comment on column agencies.rfc is 'RFC emisor, como aparece en el CFDI.';
comment on column agencies.location is 'Texto libre de ubicación, como se lee en la factura.';
comment on column agencies.status is 'draft | needs_review | ready — lo deriva la app al guardar.';

create index if not exists agencies_rfc_idx on agencies (rfc);
create index if not exists agencies_group_idx on agencies (group_id);
create index if not exists agencies_name_idx on agencies (lower(name));
create index if not exists agencies_status_idx on agencies (status);

-- -----------------------------------------------------------------------------
-- Facturas origen (puente a documentos analizados, type = invoice)
-- -----------------------------------------------------------------------------
create table if not exists agency_source_invoices (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  -- UUID en la tabla de documentos analizados. No es FK SQL: en fase 1
  -- las fichas y las facturas pueden vivir en proyectos distintos de Pass.
  invoice_id uuid,
  file_url text not null default '',
  vehicle_id uuid,
  file_id uuid,
  label text not null default '',
  document_type text not null default '',
  uuid text not null default '',
  internal_folio text not null default '',
  invoice_date date,
  rfc_receptor text not null default '',
  total numeric,
  has_signature text not null default '',
  signature_type text not null default '',
  seals_visible text not null default '',
  identified_seal text not null default '',
  qr_present text not null default '',
  qr_functional text not null default '',
  sat_verification text not null default '',
  sat_result text not null default '',
  document_quality text not null default '',
  dictamen text not null default '',
  quality_reasons text[] not null default '{}',
  quality_notes text not null default '',
  created_at timestamptz not null default now()
);

comment on table agency_source_invoices is
  'Documento que descubrió o confirma la agencia. invoice_id / file_url cruzan con documents (type = invoice).';
comment on column agency_source_invoices.file_url is
  'URL de Storage: /storage/v1/object/public/vehicles/{env}/{vehicle_id}/{file_id}.{ext}';
comment on column agency_source_invoices.uuid is 'Folio fiscal / UUID del CFDI.';

create index if not exists agency_source_invoices_agency_idx on agency_source_invoices (agency_id);
create index if not exists agency_source_invoices_invoice_idx on agency_source_invoices (invoice_id);
create index if not exists agency_source_invoices_uuid_idx on agency_source_invoices (uuid);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists automotive_groups_set_updated_at on automotive_groups;
create trigger automotive_groups_set_updated_at
  before update on automotive_groups
  for each row execute function set_updated_at();

drop trigger if exists agencies_set_updated_at on agencies;
create trigger agencies_set_updated_at
  before update on agencies
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS — la app habla con service_role (bypasea RLS).
-- Anon no lee ni escribe. Cuando Nexcar tome la base, se sustituyen policies.
-- -----------------------------------------------------------------------------
alter table automotive_groups enable row level security;
alter table agencies enable row level security;
alter table agency_source_invoices enable row level security;
