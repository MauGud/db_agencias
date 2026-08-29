import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedAgencies, seedGroups } from "@/lib/seed/agencies";
import type { Agency, AutomotiveGroup, StoreSnapshot } from "./types";

const FILE = path.join(process.cwd(), "data", "store.json");

async function readStore(): Promise<StoreSnapshot> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as StoreSnapshot;
  } catch {
    const snapshot: StoreSnapshot = { groups: seedGroups, agencies: seedAgencies };
    await persist(snapshot);
    return snapshot;
  }
}

async function persist(snapshot: StoreSnapshot) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(snapshot, null, 2), "utf8");
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
