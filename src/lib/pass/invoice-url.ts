import type { ParsedInvoiceUrl } from "./types";

/**
 * Parsea el URL de Storage que aparece en cada bloque de la hoja.
 * https://{project}.supabase.co/storage/v1/object/public/vehicles/prod/{vehicleId}/{fileId}.pdf
 */
export function parseInvoiceStorageUrl(url: string): ParsedInvoiceUrl | null {
  try {
    const parsed = new URL(url.trim());
    const match = parsed.pathname.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/,
    );
    if (!match) return null;
    const [, bucket, storageEnv, vehicleId, filename] = match;
    const dot = filename.lastIndexOf(".");
    const fileId = dot >= 0 ? filename.slice(0, dot) : filename;
    const extension = dot >= 0 ? filename.slice(dot + 1) : "";
    return {
      fileUrl: parsed.toString(),
      bucket,
      storageEnv,
      vehicleId,
      fileId,
      extension,
    };
  } catch {
    return null;
  }
}
