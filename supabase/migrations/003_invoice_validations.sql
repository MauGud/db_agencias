-- =============================================================================
-- Validaciones de factura origen (AMDA, SAT, lista negra, falsa, ubicación)
-- =============================================================================
-- Corre esto en SQL Editor del mismo proyecto de agencias, DESPUÉS de 001 y 002.
-- No borra folio fiscal ni total: dejan de capturarse en el formulario, pero
-- las columnas viejas se conservan por si hay fichas ya guardadas.
-- =============================================================================

alter table agency_source_invoices
  add column if not exists amda boolean not null default false,
  add column if not exists amda_found text not null default '',
  add column if not exists amda_matches text not null default '',
  add column if not exists signature_location text not null default '',
  add column if not exists seal_location text not null default '',
  add column if not exists blacklisted boolean not null default false,
  add column if not exists is_fake boolean not null default false,
  add column if not exists tags text[] not null default '{}';

comment on column agency_source_invoices.amda is
  'La factura se validó contra AMDA.';
comment on column agency_source_invoices.amda_found is
  'Sí / No: la factura apareció en AMDA.';
comment on column agency_source_invoices.amda_matches is
  'Sí / No: el resultado de AMDA coincide con los datos de la factura.';
comment on column agency_source_invoices.signature_location is
  'Dónde se ubica la firma en el documento.';
comment on column agency_source_invoices.seal_location is
  'Dónde se ubica el sello en el documento.';
comment on column agency_source_invoices.blacklisted is
  'Marca de lista negra. Genera la etiqueta Lista negra.';
comment on column agency_source_invoices.is_fake is
  'Factura falsa. Se marca sola si la verificación SAT o la coincidencia SAT es No.';
comment on column agency_source_invoices.tags is
  'Etiquetas de la factura (AMDA, Lista negra, Falsa y las que se agreguen después).';

create index if not exists agency_source_invoices_blacklisted_idx
  on agency_source_invoices (blacklisted) where blacklisted;
create index if not exists agency_source_invoices_fake_idx
  on agency_source_invoices (is_fake) where is_fake;
