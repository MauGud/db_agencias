import {
  composedLocation,
  matchMexicanState,
  namesLikelySame,
  parseMexicanAddress,
  preferMunicipality,
  type ParsedMexicanAddress,
} from "@/lib/mexico-address";

export type GeoResolveInput = {
  name?: string;
  address?: string;
};

export type GeoResolveResult = {
  state: string;
  municipality: string;
  city: string;
  postalCode: string;
  location: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  mapsPlaceName: string;
  mapsLat: number | null;
  mapsLng: number | null;
  foundBy: "address" | "name" | "search" | "";
  nameMismatch: boolean;
  reviewMessage: string | null;
};

type NominatimHit = {
  display_name?: string;
  lat?: string;
  lon?: string;
  name?: string;
  class?: string;
  type?: string;
  addresstype?: string;
  address?: {
    postcode?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    city_district?: string;
    borough?: string;
    suburb?: string;
    road?: string;
    house_number?: string;
  };
};

function googleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function googleMapsEmbedUrl(query: string, lat?: number | null, lng?: number | null) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function emptyResult(query: string): GeoResolveResult {
  return {
    state: "",
    municipality: "",
    city: "",
    postalCode: "",
    location: "",
    mapsUrl: query ? googleMapsSearchUrl(query) : "",
    mapsEmbedUrl: query ? googleMapsEmbedUrl(query) : "",
    mapsPlaceName: "",
    mapsLat: null,
    mapsLng: null,
    foundBy: "",
    nameMismatch: false,
    reviewMessage: null,
  };
}

function fromNominatim(hit: NominatimHit) {
  const addr = hit.address ?? {};
  const city = addr.city || addr.town || addr.village || "";
  const municipality = addr.municipality || addr.city_district || addr.borough || addr.county || "";
  return {
    state: matchMexicanState(addr.state || "") || matchMexicanState(hit.display_name || ""),
    municipality,
    city,
    postalCode: (addr.postcode || "").replace(/\D/g, "").slice(0, 5),
    mapsPlaceName: hit.name || (hit.display_name || "").split(",")[0] || "",
    mapsLat: hit.lat ? Number(hit.lat) : null,
    mapsLng: hit.lon ? Number(hit.lon) : null,
  };
}

function merge(base: ParsedMexicanAddress, extra: Partial<ParsedMexicanAddress>) {
  const state = extra.state || base.state;
  return {
    state,
    municipality: preferMunicipality(base.municipality, extra.municipality || "", state),
    city: extra.city || base.city,
    postalCode: base.postalCode || extra.postalCode,
  };
}

function cleanedAddressQuery(address: string, parsed: ParsedMexicanAddress) {
  const street = (address.split(/[,/|]+/)[0] ?? address).replace(/\bcol(?:onia)?\.?\s+.*/i, "").trim();
  return [street, parsed.city, parsed.municipality, parsed.state, parsed.postalCode, "México"]
    .filter(Boolean)
    .filter((part, i, all) => all.findIndex((x) => x.toLowerCase() === part.toLowerCase()) === i)
    .join(", ");
}

const nominatimCache = new Map<string, NominatimHit[]>();
let nominatimChain = Promise.resolve();

async function nominatimSearch(query: string) {
  const key = query.trim().toLowerCase();
  if (!key) return [] as NominatimHit[];
  const cached = nominatimCache.get(key);
  if (cached) return cached;

  const run = nominatimChain.then(async () => {
    const again = nominatimCache.get(key);
    if (again) return again;
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("countrycodes", "mx");
      url.searchParams.set("limit", "5");
      url.searchParams.set("q", query);
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "facturas-gael/pass (captura de agencias Nexcar)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return [] as NominatimHit[];
      const hits = (await res.json()) as NominatimHit[];
      nominatimCache.set(key, hits);
      await new Promise((r) => setTimeout(r, 1100));
      return hits;
    } catch {
      return [] as NominatimHit[];
    }
  });
  nominatimChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function isNamedPlace(hit: NominatimHit) {
  const cls = (hit.class || "").toLowerCase();
  const type = (hit.type || hit.addresstype || "").toLowerCase();
  if (["highway", "railway", "boundary", "waterway"].includes(cls)) return false;
  const name = hit.name || "";
  if (!name.trim()) return false;
  if (/^(avenida|calle|boulevard|blvd|carretera|camino)\b/i.test(name)) return false;
  if (cls === "place" && ["house", "houses", "road"].includes(type)) return false;
  return true;
}

function pickNameHit(hits: NominatimHit[], agencyName: string) {
  const places = hits.filter(isNamedPlace);
  const pool = places.length ? places : hits;
  if (!pool.length) return null;
  const named = pool.find((h) => namesLikelySame(agencyName, h.name || h.display_name || ""));
  return named ?? (places[0] ?? null);
}

export async function resolveAgencyPlace(input: GeoResolveInput): Promise<GeoResolveResult> {
  const name = (input.name ?? "").trim();
  const address = (input.address ?? "").trim();
  const parsed = address ? parseMexicanAddress(address) : { state: "", municipality: "", city: "", postalCode: "" };
  const searchQuery = [name, address].filter(Boolean).join(" ");
  const result = emptyResult(searchQuery || name || address);

  result.state = parsed.state;
  result.municipality = parsed.municipality;
  result.city = parsed.city;
  result.postalCode = parsed.postalCode;

  let addressHit: NominatimHit | null = null;
  let nameHit: NominatimHit | null = null;

  if (address.length >= 8) {
    try {
      addressHit = (await nominatimSearch(`${address}, México`))[0] ?? null;
      if (!addressHit) {
        const cleaned = cleanedAddressQuery(address, parsed);
        if (cleaned) addressHit = (await nominatimSearch(cleaned))[0] ?? null;
      }
    } catch {
      addressHit = null;
    }
  }

  if (name.length >= 3) {
    try {
      const locale = [parsed.city, parsed.state, parsed.postalCode, "México"].filter(Boolean).join(", ");
      const hits = await nominatimSearch(`${name} agencia ${locale}`.trim());
      nameHit = pickNameHit(hits, name);
    } catch {
      nameHit = null;
    }
  }

  const poiHit =
    (nameHit && isNamedPlace(nameHit) ? nameHit : null) ??
    (addressHit && isNamedPlace(addressHit) ? addressHit : null);
  const fieldsHit = addressHit ?? nameHit;

  if (fieldsHit) {
    Object.assign(result, merge(parsed, fromNominatim(fieldsHit)));
  }

  if (poiHit) {
    const extra = fromNominatim(poiHit);
    result.mapsPlaceName = extra.mapsPlaceName;
    result.mapsLat = extra.mapsLat;
    result.mapsLng = extra.mapsLng;
    result.foundBy = nameHit && isNamedPlace(nameHit) ? "name" : "address";
    if (address.length >= 8 && !addressHit && nameHit) {
      result.reviewMessage =
        "La dirección pegada no se localizó. La ubicación se tomó del nombre de la agencia. Revisa que coincida con la factura.";
    }
  } else if (addressHit?.lat && addressHit?.lon) {
    const extra = fromNominatim(addressHit);
    result.mapsLat = extra.mapsLat;
    result.mapsLng = extra.mapsLng;
    result.foundBy = "address";
  } else if (searchQuery) {
    result.foundBy = "search";
  }

  const mapsQuery = [name, address || composedLocation(result)].filter(Boolean).join(" ");
  result.mapsUrl = mapsQuery ? googleMapsSearchUrl(mapsQuery) : "";
  result.mapsEmbedUrl = mapsQuery
    ? googleMapsEmbedUrl(mapsQuery, result.mapsLat, result.mapsLng)
    : "";
  result.location = composedLocation(result);

  if (name && poiHit && result.mapsPlaceName && !namesLikelySame(name, result.mapsPlaceName)) {
    result.nameMismatch = true;
    result.reviewMessage = `La agencia en el mapa se llama «${result.mapsPlaceName}», distinta a «${name}». Revisa manualmente que la agencia exista y que sea la misma ficha.`;
  }

  return result;
}
