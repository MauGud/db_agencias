/**
 * PASS — capa de datos (Supabase).
 *
 * Nexcar necesita una base de agencias y grupos para cruzar facturas que
 * llegan por inspección documental. Esta capa es el único lugar que habla
 * con la base: el resto de la app no sabe si está en la cuenta personal
 * (fase 1) o en la de Nexcar (fase 2).
 *
 * FASE 1 — Construcción
 *   Cuenta personal (padre). Setea URL + keys del proyecto de él.
 *   AGENCIES_DATABASE_PHASE=personal
 *
 * FASE 2 — Sustitución
 *   Cambia las mismas variables a la instancia de Nexcar.
 *   AGENCIES_DATABASE_PHASE=nexcar
 *   No toques queries, tablas ni UI: solo env.
 *
 * FACTURAS (invoice)
 *   Independiente de la fase de agencias. El URL de cada ficha apunta al
 *   storage de documentos analizados, type = "invoice".
 *   Patrón visto en la hoja:
 *   {url}/storage/v1/object/public/vehicles/{env}/{vehicleId}/{fileId}.{ext}
 */

export type AgenciesPhase = "personal" | "nexcar" | "local";

function read(name: string) {
  return process.env[name]?.trim() || "";
}

export const passConfig = {
  /** "personal" = padre (fase 1). "nexcar" = prod Nexcar (fase 2). */
  agenciesPhase: (read("AGENCIES_DATABASE_PHASE") || "personal") as Exclude<
    AgenciesPhase,
    "local"
  >,

  agencies: {
    url:
      read("NEXT_PUBLIC_AGENCIES_SUPABASE_URL") ||
      read("AGENCIES_SUPABASE_URL") ||
      read("SUPABASE_URL"),
    serviceRoleKey:
      read("AGENCIES_SUPABASE_SERVICE_ROLE_KEY") ||
      read("SUPABASE_SERVICE_ROLE_KEY") ||
      read("SUPABASE_SECRET_KEY") ||
      read("SUPABASE_KEY"),
    anonKey:
      read("NEXT_PUBLIC_AGENCIES_SUPABASE_ANON_KEY") ||
      read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    groupsTable: read("AGENCIES_GROUPS_TABLE") || "automotive_groups",
    agenciesTable: read("AGENCIES_TABLE") || "agencies",
    sourceInvoicesTable: read("AGENCY_SOURCE_INVOICES_TABLE") || "agency_source_invoices",
    groupHistoryTable: read("AGENCY_GROUP_HISTORY_TABLE") || "agency_group_history",
  },

  /**
   * Documentos analizados. En código y en la base el tipo es `invoice`.
   * En fase 1 esto puede seguir apuntando a Nexcar (los PDFs ya viven ahí)
   * aunque las fichas de agencia se guarden en la cuenta personal.
   */
  invoices: {
    url:
      read("NEXT_PUBLIC_INVOICES_SUPABASE_URL") ||
      read("INVOICES_SUPABASE_URL") ||
      "https://iorqdgnczgxnxbxjuibu.supabase.co",
    serviceRoleKey: read("INVOICES_SUPABASE_SERVICE_ROLE_KEY"),
    anonKey: read("NEXT_PUBLIC_INVOICES_SUPABASE_ANON_KEY"),
    table: read("INVOICES_TABLE") || "documents",
    typeColumn: read("INVOICE_TYPE_COLUMN") || "type",
    typeValue: read("INVOICE_TYPE_VALUE") || "invoice",
    idColumn: read("INVOICE_ID_COLUMN") || "id",
    urlColumn: read("INVOICE_URL_COLUMN") || "file_url",
    vehicleIdColumn: read("INVOICE_VEHICLE_ID_COLUMN") || "vehicle_id",
    storageBucket: read("INVOICES_STORAGE_BUCKET") || "vehicles",
    storageEnv: read("INVOICES_STORAGE_ENV") || "prod",
  },
} as const;

export function agenciesBackend(): AgenciesPhase {
  if (passConfig.agencies.url && (passConfig.agencies.serviceRoleKey || passConfig.agencies.anonKey)) {
    return passConfig.agenciesPhase;
  }
  return "local";
}

export function invoicesConfigured() {
  return Boolean(
    passConfig.invoices.url &&
      (passConfig.invoices.serviceRoleKey || passConfig.invoices.anonKey),
  );
}

export function phaseLabel(phase: AgenciesPhase) {
  if (phase === "nexcar") return "Fase 2 · Nexcar";
  if (phase === "personal") return "Fase 1 · cuenta personal";
  return "Fase 1 · store local";
}
