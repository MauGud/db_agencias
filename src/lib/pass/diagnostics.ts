import { agenciesBackend, isServerlessRuntime, passConfig } from "./config";
import { getAgenciesClient } from "./supabase";

export type PassDiagnostics = {
  backend: ReturnType<typeof agenciesBackend>;
  serverless: boolean;
  hasUrl: boolean;
  hasServiceRole: boolean;
  hasAnon: boolean;
  mapsColumns: boolean;
  historyTable: boolean;
  invoiceFlags: boolean;
  notice: string | null;
};

export async function getPassDiagnostics(): Promise<PassDiagnostics> {
  const cfg = passConfig;
  const backend = agenciesBackend();
  const serverless = isServerlessRuntime();
  const hasUrl = Boolean(cfg.agencies.url);
  const hasServiceRole = Boolean(cfg.agencies.serviceRoleKey);
  const hasAnon = Boolean(cfg.agencies.anonKey);

  let mapsColumns = false;
  let historyTable = false;
  let invoiceFlags = false;
  const client = getAgenciesClient();
  if (client) {
    try {
      const probe = Promise.all([
        client.from(cfg.agencies.agenciesTable).select("id,maps_url").limit(1),
        client.from(cfg.agencies.groupHistoryTable).select("id").limit(1),
        client.from(cfg.agencies.sourceInvoicesTable).select("id,amda,blacklisted,is_fake,tags").limit(1),
      ]);
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 4000);
      });
      const [maps, hist, flags] = await Promise.race([probe, timeout]);
      mapsColumns = !maps.error;
      historyTable = !hist.error;
      invoiceFlags = !flags.error;
    } catch {
      mapsColumns = false;
      historyTable = false;
      invoiceFlags = false;
    }
  }

  let notice: string | null = null;
  if (backend === "local") {
    notice = serverless
      ? "Pass no está conectado en este despliegue. Agrega NEXT_PUBLIC_AGENCIES_SUPABASE_URL y AGENCIES_SUPABASE_SERVICE_ROLE_KEY en Vercel y vuelve a desplegar."
      : "Pass no está conectado. Llena .env.local con URL y service_role para guardar grupos y fichas.";
  } else if (!mapsColumns || !historyTable) {
    notice =
      "Falta correr supabase/migrations/002_agency_maps_history.sql en el SQL Editor de Pass. Sin eso no se guardan el pin de Maps ni el grupo anterior.";
  } else if (!invoiceFlags) {
    notice =
      "Falta correr supabase/migrations/003_invoice_validations.sql en el SQL Editor de Pass. Sin eso no se guardan AMDA, lista negra, falsa ni las etiquetas de la factura.";
  }

  return {
    backend,
    serverless,
    hasUrl,
    hasServiceRole,
    hasAnon,
    mapsColumns,
    historyTable,
    invoiceFlags,
    notice,
  };
}
