import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { passConfig } from "./config";

function isNewApiKey(key: string) {
  return key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
}

function makeClient(url: string, key: string) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        "X-Client-Info": "facturas-gael/pass",
        "User-Agent": "facturas-gael/pass",
      },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("User-Agent", "facturas-gael/pass");
        if (isNewApiKey(key)) {
          headers.delete("Authorization");
        }
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Cliente de fichas (grupos + agencias). Fase 1 = padre, fase 2 = Nexcar. */
export function getAgenciesClient(): SupabaseClient | null {
  const url = passConfig.agencies.url;
  const key = passConfig.agencies.serviceRoleKey || passConfig.agencies.anonKey;
  return url && key ? makeClient(url, key) : null;
}

/** Cliente de documentos analizados (`invoice`). Puede ser otro proyecto. */
export function getInvoicesClient(): SupabaseClient | null {
  const url = passConfig.invoices.url;
  const key = passConfig.invoices.serviceRoleKey || passConfig.invoices.anonKey;
  return url && key ? makeClient(url, key) : null;
}
