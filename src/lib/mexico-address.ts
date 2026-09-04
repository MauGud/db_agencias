import { MEXICAN_STATES } from "@/lib/mexico";

const STATE_ALIASES: Array<[RegExp, (typeof MEXICAN_STATES)[number]]> = [
  [/\b(baja\s*california\s*sur|b\.?\s*c\.?\s*s\.?)\b/i, "Baja California Sur"],
  [/\b(baja\s*california|b\.?\s*c\.?)\b/i, "Baja California"],
  [/\b(ciudad\s*de\s*m[eé]xico|cdmx|d\.?\s*f\.?|distrito\s*federal)\b/i, "Ciudad de México"],
  [/\b(estado\s*de\s*m[eé]xico|edo\.?\s*(de\s*)?m[eé]x(\.|ico)?|edomex)\b/i, "Estado de México"],
  [/\b(nuevo\s*le[oó]n|n\.?\s*l\.?)\b/i, "Nuevo León"],
  [/\b(san\s*luis\s*potos[ií]|s\.?\s*l\.?\s*p\.?)\b/i, "San Luis Potosí"],
  [/\b(quintana\s*roo|q\.?\s*roo|q\.?\s*r\.?)\b/i, "Quintana Roo"],
  [/\b(quer[eé]taro|qro\.?)\b/i, "Querétaro"],
  [/\b(aguascalientes)\b/i, "Aguascalientes"],
  [/\b(campeche)\b/i, "Campeche"],
  [/\b(chiapas)\b/i, "Chiapas"],
  [/\b(chihuahua)\b/i, "Chihuahua"],
  [/\b(coahuila)\b/i, "Coahuila"],
  [/\b(colima)\b/i, "Colima"],
  [/\b(durango)\b/i, "Durango"],
  [/\b(guanajuato)\b/i, "Guanajuato"],
  [/\b(guerrero)\b/i, "Guerrero"],
  [/\b(hidalgo)\b/i, "Hidalgo"],
  [/\b(jalisco)\b/i, "Jalisco"],
  [/\b(michoac[aá]n)\b/i, "Michoacán"],
  [/\b(morelos)\b/i, "Morelos"],
  [/\b(nayarit)\b/i, "Nayarit"],
  [/\b(oaxaca)\b/i, "Oaxaca"],
  [/\b(puebla)\b/i, "Puebla"],
  [/\b(sinaloa)\b/i, "Sinaloa"],
  [/\b(sonora)\b/i, "Sonora"],
  [/\b(tabasco)\b/i, "Tabasco"],
  [/\b(tamaulipas)\b/i, "Tamaulipas"],
  [/\b(tlaxcala)\b/i, "Tlaxcala"],
  [/\b(veracruz)\b/i, "Veracruz"],
  [/\b(yucat[aá]n)\b/i, "Yucatán"],
  [/\b(zacatecas)\b/i, "Zacatecas"],
];

export type ParsedMexicanAddress = {
  state: string;
  municipality: string;
  city: string;
  postalCode: string;
};

export const CDMX_ALCALDIAS = [
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa de Morelos",
  "Cuajimalpa",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "La Magdalena Contreras",
  "Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco",
] as const;

function findCdmxAlcaldia(value: string) {
  const text = fold(value).toLowerCase();
  const hit = CDMX_ALCALDIAS.find((a) => text.includes(fold(a).toLowerCase()));
  if (!hit) return "";
  if (hit === "Cuajimalpa") return "Cuajimalpa de Morelos";
  if (hit === "Magdalena Contreras") return "La Magdalena Contreras";
  return hit;
}

function isStreetish(part: string) {
  const t = part.replace(/^[.,/\s]+/, "").trim();
  if (t.length < 3) return true;
  if (/\d/.test(t)) return true;
  if (/^(av\.?|ave\.?|avenida|blvd\.?|boulevard|calle|andador|privada|col\.?|colonia)\b/i.test(t)) return true;
  if (/^presidente\b/i.test(t)) return true;
  return false;
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchMexicanState(value: string) {
  const text = fold(value);
  for (const [pattern, state] of STATE_ALIASES) {
    if (pattern.test(text)) return state;
  }
  const lower = text.toLowerCase();
  return MEXICAN_STATES.find((s) => fold(s).toLowerCase() === lower) ?? "";
}

export function parseMexicanAddress(raw: string): ParsedMexicanAddress {
  let text = raw.replace(/\s+/g, " ").trim();
  const parsed: ParsedMexicanAddress = { state: "", municipality: "", city: "", postalCode: "" };

  const cp = text.match(/\b(?:c\.?\s*p\.?\s*)?(\d{5})\b/i);
  if (cp) {
    parsed.postalCode = cp[1];
    text = text.replace(cp[0], " ");
  }

  for (const [pattern, state] of STATE_ALIASES) {
    if (pattern.test(text)) {
      parsed.state = state;
      text = text.replace(pattern, " ");
      break;
    }
  }

  const alcaldia = findCdmxAlcaldia(text);
  if (alcaldia) {
    parsed.municipality = alcaldia;
    if (!parsed.state) parsed.state = "Ciudad de México";
    text = text.replace(new RegExp(alcaldia.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ");
  }

  const mun = text.match(/\b(?:alcald[ií]a|municipio|mun\.?|alc\.?)\s+(?:de\s+)?([^,]+)/i);
  if (mun && !parsed.municipality) {
    parsed.municipality = mun[1].replace(/\bcol(?:onia)?\.?\b/gi, "").trim();
    text = text.replace(mun[0], " ");
  }

  const parts = text
    .split(/[,/|]+/)
    .map((p) =>
      p
        .replace(/\bcol(?:onia)?\.?\s+\S+/gi, "")
        .replace(/\bno\.?\s*\d+\w*/gi, "")
        .replace(/\b(av\.?|ave\.?|avenida|blvd\.?|boulevard|calle|andador|privada)\b/gi, "")
        .replace(/^[.,\s]+/, "")
        .trim(),
    )
    .filter((p) => !isStreetish(p));

  if (parsed.state === "Ciudad de México") {
    parsed.city = parsed.city || "Ciudad de México";
  } else {
    if (!parsed.city && parts.length) parsed.city = parts[parts.length - 1] ?? "";
    if (!parsed.municipality && parts.length > 1) parsed.municipality = parts[parts.length - 2] ?? "";
  }

  return parsed;
}

const NOISE = [
  "sa de cv",
  "s.a. de c.v.",
  "s de rl",
  "automotriz",
  "automoviles",
  "concesionaria",
  "agencia",
  "center",
  "grupo",
  "de",
  "la",
  "el",
  "los",
  "las",
  "del",
];

export function normalizeAgencyName(value: string) {
  return fold(value)
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .split(" ")
    .filter((t) => t && !NOISE.includes(t))
    .join(" ")
    .trim();
}

export function namesLikelySame(entered: string, found: string) {
  const a = normalizeAgencyName(entered);
  const b = normalizeAgencyName(found);
  if (!a || !b) return true;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const at = new Set(a.split(" "));
  const bt = b.split(" ").filter(Boolean);
  if (!bt.length) return true;
  const overlap = bt.filter((t) => at.has(t)).length;
  return overlap / Math.max(at.size, bt.length) >= 0.4;
}

export function preferMunicipality(parsed: string, geo: string) {
  return findCdmxAlcaldia(parsed) || findCdmxAlcaldia(geo) || parsed || geo;
}

export function composedLocation(parts: { municipality?: string; city?: string; state?: string }) {
  const unique: string[] = [];
  for (const part of [parts.municipality, parts.city, parts.state]) {
    const v = part?.trim();
    if (v && !unique.some((u) => u.toLowerCase() === v.toLowerCase())) unique.push(v);
  }
  return unique.join(", ");
}
