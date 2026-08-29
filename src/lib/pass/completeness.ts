import { isBlankish } from "@/lib/utils";
import { rfcError } from "@/lib/mexico";
import type { Agency, AgencyStatus } from "./types";

export type CompletenessItem = {
  id: string;
  label: string;
  done: boolean;
  required: boolean;
};

export function completenessItems(agency: Pick<
  Agency,
  | "name"
  | "groupId"
  | "legalName"
  | "rfc"
  | "brand"
  | "state"
  | "city"
  | "address"
  | "sources"
>) {
  const items: CompletenessItem[] = [
    { id: "name", label: "Nombre de la agencia", done: !isBlankish(agency.name), required: true },
    { id: "group", label: "Grupo automotriz", done: Boolean(agency.groupId), required: true },
    { id: "legal", label: "Razón social", done: !isBlankish(agency.legalName), required: true },
    {
      id: "rfc",
      label: "RFC emisor",
      done: !isBlankish(agency.rfc) && !rfcError(agency.rfc),
      required: true,
    },
    { id: "brand", label: "Marca", done: !isBlankish(agency.brand), required: true },
    { id: "state", label: "Estado", done: !isBlankish(agency.state), required: true },
    { id: "city", label: "Ciudad", done: !isBlankish(agency.city), required: false },
    { id: "address", label: "Dirección", done: !isBlankish(agency.address), required: true },
    {
      id: "source",
      label: "Factura origen",
      done: agency.sources.some((s) => Boolean(s.fileUrl || s.invoiceId)),
      required: false,
    },
  ];
  return items;
}

export function deriveStatus(agency: Parameters<typeof completenessItems>[0]): AgencyStatus {
  const items = completenessItems(agency);
  const required = items.filter((i) => i.required);
  const missing = required.filter((i) => !i.done);
  if (missing.length === 0) return "ready";
  if (missing.length <= 2 && items.some((i) => i.done)) return "needs_review";
  return "draft";
}

export function completenessScore(agency: Parameters<typeof completenessItems>[0]) {
  const items = completenessItems(agency);
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, requiredDone: items.filter((i) => i.required && i.done).length, requiredTotal: items.filter((i) => i.required).length };
}
