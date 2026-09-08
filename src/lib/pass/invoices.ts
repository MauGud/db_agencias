import { invoicesConfigured, passConfig } from "./config";
import { parseInvoiceStorageUrl } from "./invoice-url";
import { getInvoicesClient } from "./supabase";
import type { InvoiceRecord } from "./types";

export { parseInvoiceStorageUrl } from "./invoice-url";

export function buildInvoiceStorageUrl(input: {
  vehicleId: string;
  fileId: string;
  extension?: string;
}) {
  const base = passConfig.invoices.url.replace(/\/$/, "");
  const ext = input.extension || "pdf";
  return `${base}/storage/v1/object/public/${passConfig.invoices.storageBucket}/${passConfig.invoices.storageEnv}/${input.vehicleId}/${input.fileId}.${ext}`;
}

function asRecord(row: Record<string, unknown>): InvoiceRecord {
  const id = String(row[passConfig.invoices.idColumn] ?? row.id ?? "");
  const fileUrl = String(
    row[passConfig.invoices.urlColumn] ??
      row.file_url ??
      row.url ??
      row.storage_url ??
      "",
  );
  const vehicleId = (row[passConfig.invoices.vehicleIdColumn] ??
    row.vehicle_id ??
    null) as string | null;
  const type = String(row[passConfig.invoices.typeColumn] ?? row.type ?? "invoice");
  return { id, fileUrl, vehicleId, type, raw: row };
}

/**
 * Busca facturas (`invoice`) en la base de documentos analizados.
 * Si Pass de facturas no está configurado, no inventa resultados:
 * el UI puede seguir pegando el URL a mano.
 */
export async function searchInvoices(query: string): Promise<InvoiceRecord[]> {
  const q = query.trim();
  if (!q || !invoicesConfigured()) return [];

  const client = getInvoicesClient();
  if (!client) return [];

  const table = passConfig.invoices.table;
  const typeCol = passConfig.invoices.typeColumn;
  const typeVal = passConfig.invoices.typeValue;
  const parsed = parseInvoiceStorageUrl(q);
  const needle = (parsed?.fileId || q).replace(/[,()]/g, " ").trim();
  if (!needle) return [];

  let request = client.from(table).select("*").eq(typeCol, typeVal).limit(12);

  if (parsed) {
    request = request.or(
      `${passConfig.invoices.idColumn}.eq.${parsed.fileId},${passConfig.invoices.vehicleIdColumn}.eq.${parsed.vehicleId},${passConfig.invoices.urlColumn}.ilike.%${parsed.fileId}%`,
    );
  } else {
    request = request.or(
      `${passConfig.invoices.idColumn}.eq.${needle},${passConfig.invoices.vehicleIdColumn}.eq.${needle},${passConfig.invoices.urlColumn}.ilike.%${needle}%`,
    );
  }

  const { data, error } = await request;
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(asRecord);
}

export async function getInvoiceById(id: string): Promise<InvoiceRecord | null> {
  if (!id || !invoicesConfigured()) return null;
  const client = getInvoicesClient();
  if (!client) return null;
  const { data, error } = await client
    .from(passConfig.invoices.table)
    .select("*")
    .eq(passConfig.invoices.idColumn, id)
    .eq(passConfig.invoices.typeColumn, passConfig.invoices.typeValue)
    .maybeSingle();
  if (error || !data) return null;
  return asRecord(data as Record<string, unknown>);
}
