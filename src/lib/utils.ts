import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMxn(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatIsoDate(value: string | null | undefined) {
  if (!value) return "—";
  return value;
}

export function formatConversationalDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function maskRfc(rfc: string | null | undefined) {
  if (!rfc) return "—";
  const clean = rfc.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}••••••${clean.slice(-3)}`;
}

export function isBlankish(value: string | null | undefined) {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  return (
    v.length === 0 ||
    v === "no visible" ||
    v === "no visible en factura" ||
    v === "no visible con certeza" ||
    v === "no se alcanza a leer con certeza" ||
    v === "no contiene"
  );
}
