-- =============================================================================
-- Ubicación de Maps + historial de grupo automotriz
-- =============================================================================
-- Corre esto en SQL Editor del mismo proyecto de agencias (fase 1 o 2).
-- El campo agencies.location deja de capturarse a mano: se deriva de
-- municipio / ciudad / estado. maps_* guarda el pin y el link de Google Maps.
-- agency_group_history registra grupos/marcas que la agencia vendió antes
-- (ej. Jebla Motos vendía BAIC y ahora Chevrolet).
-- =============================================================================

alter table agencies
  add column if not exists maps_url text not null default '',
  add column if not exists maps_place_name text not null default '',
  add column if not exists maps_lat double precision,
  add column if not exists maps_lng double precision;

comment on column agencies.location is
  'Ubicación derivada (municipio, ciudad, estado). Ya no es texto libre de captura.';
comment on column agencies.maps_url is
  'Link a Google Maps de la agencia (búsqueda por nombre + dirección).';
comment on column agencies.maps_place_name is
  'Nombre con el que aparece el lugar en el mapa. Sirve para cotejar con la ficha.';

create table if not exists agency_group_history (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  group_id uuid not null references automotive_groups(id) on delete restrict,
  brand text not null default '',
  note text not null default '',
  recorded_at timestamptz not null default now()
);

comment on table agency_group_history is
  'Grupos / marcas anteriores de la misma agencia. No sustituye group_id actual.';

create index if not exists agency_group_history_agency_idx on agency_group_history (agency_id);
create index if not exists agency_group_history_group_idx on agency_group_history (group_id);

alter table agency_group_history enable row level security;
