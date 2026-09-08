import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedAgencies, seedGroups } from "@/lib/seed/agencies";
import { isServerlessRuntime, passKeysMissingMessage } from "./config";
import { migrateIdentifiedSeal, syncInvoiceFlags } from "./invoice-flags";
import type { Agency, AutomotiveGroup, SourceInvoice, StoreSnapshot } from "./types";

function withSourceDefaults(source: SourceInvoice): SourceInvoice {
  return syncInvoiceFlags({
    ...source,
    signatureLocation: source.signatureLocation ?? "",
    ...migrateIdentifiedSeal(source.identifiedSeal ?? "", source.sealLocation ?? ""),
    amda: Boolean(source.amda),
    amdaFound: source.amdaFound ?? "",
    amdaMatches: source.amdaMatches ?? "",
    blacklisted: Boolean(source.blacklisted),
    isFake: Boolean(source.isFake),
    tags: Array.isArray(source.tags) ? source.tags : [],
  });
}

function withAgencyDefaults(agency: Agency): Agency {
  return {
    ...agency,
    mapsUrl: agency.mapsUrl ?? "",
    mapsPlaceName: agency.mapsPlaceName ?? "",
    mapsLat: agency.mapsLat ?? null,
    mapsLng: agency.mapsLng ?? null,
    groupHistory: agency.groupHistory ?? [],
    sources: (agency.sources ?? []).map(withSourceDefaults),
  };
}

const FILE = path.join(process.cwd(), "data", "store.json");

async function readStore(): Promise<StoreSnapshot> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreSnapshot;
    return {
      groups: parsed.groups ?? [],
      agencies: (parsed.agencies ?? []).map(withAgencyDefaults),
    };
  } catch {
    const snapshot: StoreSnapshot = { groups: seedGroups, agencies: seedAgencies };
    await persist(snapshot, false);
    return snapshot;
  }
}

async function persist(snapshot: StoreSnapshot, required = true) {
  if (isServerlessRuntime()) {
    if (!required) return;
    throw new Error(passKeysMissingMessage());
  }
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(snapshot, null, 2), "utf8");
  } catch (error) {
    if (!required) return;
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "EROFS" || code === "EPERM" || code === "EACCES" || code === "ENOENT") {
      throw new Error(passKeysMissingMessage());
    }
    throw error instanceof Error ? error : new Error("No pudimos guardar el store local.");
  }
}

export async function localList(): Promise<StoreSnapshot> {
  return readStore();
}

export async function localSaveGroup(group: AutomotiveGroup) {
  const store = await readStore();
  const idx = store.groups.findIndex((g) => g.id === group.id);
  if (idx >= 0) store.groups[idx] = group;
  else store.groups.push(group);
  await persist(store);
  return group;
}

export async function localSaveAgency(agency: Agency) {
  const store = await readStore();
  const idx = store.agencies.findIndex((a) => a.id === agency.id);
  if (idx >= 0) store.agencies[idx] = agency;
  else store.agencies.push(agency);
  await persist(store);
  return agency;
}

export async function localDeleteAgency(id: string) {
  const store = await readStore();
  store.agencies = store.agencies.filter((a) => a.id !== id);
  await persist(store);
}
