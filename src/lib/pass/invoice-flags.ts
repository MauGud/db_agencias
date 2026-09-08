export type YesNo = "" | "Sí" | "No";

export const TAG_LISTA_NEGRA = "Lista negra";
export const TAG_FALSA = "Falsa";
export const TAG_AMDA = "AMDA";

export function normalizeYesNo(value: string): YesNo {
  const v = value.trim().toLowerCase();
  if (!v || v === "pendiente") return "";
  if (["sí", "si", "yes", "válida", "valida", "true", "1"].includes(v)) return "Sí";
  if (["no", "no visible", "false", "0"].includes(v)) return "No";
  if (value === "Sí" || value === "No") return value;
  return "";
}

/** Sello identificado pasó de texto libre a Sí/No; el texto viejo queda en la ubicación. */
export function migrateIdentifiedSeal(identified: string, location = "") {
  const yn = normalizeYesNo(identified);
  if (yn) return { identifiedSeal: yn, sealLocation: location };
  if (!identified.trim()) return { identifiedSeal: "" as const, sealLocation: location };
  return { identifiedSeal: "Sí" as const, sealLocation: location || identified };
}

const MANAGED_TAGS = new Set([TAG_LISTA_NEGRA, TAG_FALSA, TAG_AMDA]);

export type InvoiceFlagFields = {
  amda: boolean;
  amdaFound: string;
  amdaMatches: string;
  satVerification: string;
  satResult: string;
  blacklisted: boolean;
  isFake: boolean;
  tags: string[];
};

export function satForcesFake(satVerification: string, satResult: string) {
  return satVerification === "No" || satResult === "No";
}

export function syncInvoiceFlags<T extends InvoiceFlagFields>(source: T): T {
  const isFake = satForcesFake(source.satVerification, source.satResult) || source.isFake;
  const extras = source.tags.filter((tag) => tag.trim() && !MANAGED_TAGS.has(tag));
  const tags = [...extras];
  if (source.amda) tags.push(TAG_AMDA);
  if (source.blacklisted) tags.push(TAG_LISTA_NEGRA);
  if (isFake) tags.push(TAG_FALSA);
  return {
    ...source,
    isFake,
    amdaFound: source.amda ? source.amdaFound : "",
    amdaMatches: source.amda ? source.amdaMatches : "",
    tags,
  };
}

export function tagVariant(tag: string) {
  if (tag === TAG_LISTA_NEGRA) return "destructive" as const;
  if (tag === TAG_FALSA) return "warning" as const;
  if (tag === TAG_AMDA) return "info" as const;
  return "secondary" as const;
}
