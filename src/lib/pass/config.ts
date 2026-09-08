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

function trimEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") || "";
}

/**
 * Next only inlines static `process.env.NAME` into serverless bundles.
 * `process.env[name]` can look empty on Vercel even when the variable
 * exists in the project settings — that made group creation fall back
 * to writing `data/store.json` under `/var/task`.
 */
function loadPassConfig() {
  return {
  /** "personal" = padre (fase 1). "nexcar" = prod Nexcar (fase 2). */
  agenciesPhase: (trimEnv(process.env.AGENCIES_DATABASE_PHASE) || "personal") as Exclude<
    AgenciesPhase,
    "local"
  >,

  agencies: {
    url:
      trimEnv(process.env.NEXT_PUBLIC_AGENCIES_SUPABASE_URL) ||
      trimEnv(process.env.AGENCIES_SUPABASE_URL) ||
      trimEnv(process.env.SUPABASE_URL),
    serviceRoleKey:
      trimEnv(process.env.AGENCIES_SUPABASE_SERVICE_ROLE_KEY) ||
      trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
      trimEnv(process.env.SUPABASE_SECRET_KEY) ||
      trimEnv(process.env.SUPABASE_KEY),
    anonKey:
      trimEnv(process.env.NEXT_PUBLIC_AGENCIES_SUPABASE_ANON_KEY) ||
      trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    groupsTable: trimEnv(process.env.AGENCIES_GROUPS_TABLE) || "automotive_groups",
    agenciesTable: trimEnv(process.env.AGENCIES_TABLE) || "agencies",
    sourceInvoicesTable: trimEnv(process.env.AGENCY_SOURCE_INVOICES_TABLE) || "agency_source_invoices",
    groupHistoryTable: trimEnv(process.env.AGENCY_GROUP_HISTORY_TABLE) || "agency_group_history",
  },

  /**
   * Documentos analizados. En código y en la base el tipo es `invoice`.
   * En fase 1 esto puede seguir apuntando a Nexcar (los PDFs ya viven ahí)
   * aunque las fichas de agencia se guarden en la cuenta personal.
   */
  invoices: {
    url:
      trimEnv(process.env.NEXT_PUBLIC_INVOICES_SUPABASE_URL) ||
      trimEnv(process.env.INVOICES_SUPABASE_URL) ||
      "https://iorqdgnczgxnxbxjuibu.supabase.co",
    serviceRoleKey: trimEnv(process.env.INVOICES_SUPABASE_SERVICE_ROLE_KEY),
    anonKey: trimEnv(process.env.NEXT_PUBLIC_INVOICES_SUPABASE_ANON_KEY),
    table: trimEnv(process.env.INVOICES_TABLE) || "documents",
    typeColumn: trimEnv(process.env.INVOICE_TYPE_COLUMN) || "type",
    typeValue: trimEnv(process.env.INVOICE_TYPE_VALUE) || "invoice",
    idColumn: trimEnv(process.env.INVOICE_ID_COLUMN) || "id",
    urlColumn: trimEnv(process.env.INVOICE_URL_COLUMN) || "file_url",
    vehicleIdColumn: trimEnv(process.env.INVOICE_VEHICLE_ID_COLUMN) || "vehicle_id",
    storageBucket: trimEnv(process.env.INVOICES_STORAGE_BUCKET) || "vehicles",
    storageEnv: trimEnv(process.env.INVOICES_STORAGE_ENV) || "prod",
  },
  };
}

export function getPassConfig() {
  return loadPassConfig();
}

/** Reads env on every access so Vercel serverless sees runtime keys, not build-time empties. */
export const passConfig = {
  get agenciesPhase() {
    return loadPassConfig().agenciesPhase;
  },
  get agencies() {
    return loadPassConfig().agencies;
  },
  get invoices() {
    return loadPassConfig().invoices;
  },
};

export function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
}

export function passKeysMissingMessage() {
  if (isServerlessRuntime()) {
    return "Pass no está configurado en este despliegue. En Vercel → Settings → Environment Variables agrega NEXT_PUBLIC_AGENCIES_SUPABASE_URL y AGENCIES_SUPABASE_SERVICE_ROLE_KEY (Production) y vuelve a desplegar.";
  }
  return "Faltan las keys de Pass. Copia .env.example a .env.local y llena URL + service_role.";
}

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
