import { composedLocation } from "@/lib/mexico-address";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { agenciesBackend, isServerlessRuntime, passConfig, passKeysMissingMessage } from "./config";
import { deriveStatus } from "./completeness";
import { localDeleteAgency, localList, localSaveAgency, localSaveGroup } from "./local-store";
import { getAgenciesClient } from "./supabase";
import type { Agency, AgencyGroupHistory, AgencyInput, AutomotiveGroup, SourceInvoice, StoreSnapshot } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function nowIso() {
  return new Date().toISOString();
}

function requireWritableStore() {
  if (isServerlessRuntime()) {
    throw new Error(passKeysMissingMessage());
  }
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function asUuid(value: string | null | undefined): string | null {
  const v = text(value);
  return v && UUID_RE.test(v) ? v : null;
}

function isBlankSource(partial: AgencyInput["sources"][number]) {
  return !(
    text(partial.fileUrl) ||
    asUuid(partial.invoiceId) ||
    text(partial.uuid) ||
    text(partial.label) ||
    text(partial.internalFolio) ||
    text(partial.invoiceDate) ||
    text(partial.rfcReceptor) ||
    partial.total != null ||
    text(partial.dictamen) ||
    text(partial.qualityNotes) ||
    (partial.qualityReasons?.length ?? 0) > 0
  );
}

function bustCatalogCache(agencyId?: string) {
  revalidatePath("/agencias");
  revalidatePath("/grupos");
  revalidatePath("/", "layout");
  if (agencyId) revalidatePath(`/agencias/${agencyId}`);
}

function emptySource(agencyId: string, partial: AgencyInput["sources"][number]): SourceInvoice {
  return {
    id: asUuid(partial.id) ?? crypto.randomUUID(),
    agencyId,
    invoiceId: asUuid(partial.invoiceId),
    fileUrl: text(partial.fileUrl),
    vehicleId: asUuid(partial.vehicleId),
    fileId: asUuid(partial.fileId),
    label: text(partial.label),
    documentType: partial.documentType ?? "",
    uuid: text(partial.uuid),
    internalFolio: text(partial.internalFolio),
    invoiceDate: text(partial.invoiceDate),
    rfcReceptor: text(partial.rfcReceptor),
    total: partial.total ?? null,
    hasSignature: text(partial.hasSignature),
    signatureType: text(partial.signatureType),
    sealsVisible: text(partial.sealsVisible),
    identifiedSeal: text(partial.identifiedSeal),
    qrPresent: text(partial.qrPresent),
    qrFunctional: text(partial.qrFunctional),
    satVerification: text(partial.satVerification),
    satResult: text(partial.satResult),
    documentQuality: partial.documentQuality ?? "",
    dictamen: text(partial.dictamen),
    qualityReasons: partial.qualityReasons ?? [],
    qualityNotes: text(partial.qualityNotes),
    createdAt: nowIso(),
  };
}

function assembleAgency(input: AgencyInput, existing?: Agency): Agency {
  const id = text(input.id) || existing?.id || crypto.randomUUID();
  const createdAt = existing?.createdAt ?? nowIso();
  const sources = (input.sources ?? []).filter((s) => !isBlankSource(s)).map((s) => emptySource(id, s));
  const city = text(input.city);
  const municipality = text(input.municipality);
  const state = text(input.state);
  const groupHistory = (input.groupHistory ?? []).map((h) => ({
    id: asUuid(h.id) ?? crypto.randomUUID(),
    agencyId: id,
    groupId: text(h.groupId),
    brand: text(h.brand),
    note: text(h.note),
    recordedAt: h.recordedAt || nowIso(),
  }));
  const agency: Agency = {
    id,
    groupId: text(input.groupId),
    name: text(input.name),
    brand: text(input.brand),
    legalName: text(input.legalName),
    rfc: text(input.rfc).replace(/[\s-]/g, "").toUpperCase(),
    emitterNumber: text(input.emitterNumber),
    email: text(input.email),
    phone: text(input.phone),
    address: text(input.address),
    city,
    municipality,
    state,
    postalCode: text(input.postalCode),
    location: text(input.location) || composedLocation({ municipality, city, state }),
    mapsUrl: text(input.mapsUrl),
    mapsPlaceName: text(input.mapsPlaceName),
    mapsLat: input.mapsLat ?? null,
    mapsLng: input.mapsLng ?? null,
    notes: text(input.notes),
    status: "draft",
    createdAt,
    updatedAt: nowIso(),
    sources,
    groupHistory,
  };
  agency.status = deriveStatus(agency);
  return agency;
}

function rowToGroup(row: Record<string, unknown>): AutomotiveGroup {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    brands: Array.isArray(row.brands) ? (row.brands as string[]) : [],
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at ?? row.createdAt ?? nowIso()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? nowIso()),
  };
}

function rowToHistory(row: Record<string, unknown>): AgencyGroupHistory {
  return {
    id: String(row.id),
    agencyId: String(row.agency_id ?? ""),
    groupId: String(row.group_id ?? ""),
    brand: String(row.brand ?? ""),
    note: String(row.note ?? ""),
    recordedAt: String(row.recorded_at ?? nowIso()),
  };
}

function rowToAgency(
  row: Record<string, unknown>,
  sources: SourceInvoice[],
  groupHistory: AgencyGroupHistory[] = [],
): Agency {
  const agency: Agency = {
    id: String(row.id),
    groupId: String(row.group_id ?? row.groupId ?? ""),
    name: String(row.name ?? ""),
    brand: String(row.brand ?? ""),
    legalName: String(row.legal_name ?? row.legalName ?? ""),
    rfc: String(row.rfc ?? ""),
    emitterNumber: String(row.emitter_number ?? row.emitterNumber ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    municipality: String(row.municipality ?? ""),
    state: String(row.state ?? ""),
    postalCode: String(row.postal_code ?? row.postalCode ?? ""),
    location: String(row.location ?? ""),
    mapsUrl: String(row.maps_url ?? row.mapsUrl ?? ""),
    mapsPlaceName: String(row.maps_place_name ?? row.mapsPlaceName ?? ""),
    mapsLat: row.maps_lat == null && row.mapsLat == null ? null : Number(row.maps_lat ?? row.mapsLat),
    mapsLng: row.maps_lng == null && row.mapsLng == null ? null : Number(row.maps_lng ?? row.mapsLng),
    notes: String(row.notes ?? ""),
    status: (row.status as Agency["status"]) ?? "draft",
    createdAt: String(row.created_at ?? nowIso()),
    updatedAt: String(row.updated_at ?? nowIso()),
    sources,
    groupHistory,
  };
  agency.status = deriveStatus(agency);
  return agency;
}

function rowToSource(row: Record<string, unknown>): SourceInvoice {
  return {
    id: String(row.id),
    agencyId: String(row.agency_id ?? ""),
    invoiceId: (row.invoice_id as string | null) ?? null,
    fileUrl: String(row.file_url ?? ""),
    vehicleId: (row.vehicle_id as string | null) ?? null,
    fileId: (row.file_id as string | null) ?? null,
    label: String(row.label ?? ""),
    documentType: (row.document_type as SourceInvoice["documentType"]) ?? "",
    uuid: String(row.uuid ?? ""),
    internalFolio: String(row.internal_folio ?? ""),
    invoiceDate: String(row.invoice_date ?? ""),
    rfcReceptor: String(row.rfc_receptor ?? ""),
    total: row.total == null ? null : Number(row.total),
    hasSignature: String(row.has_signature ?? ""),
    signatureType: String(row.signature_type ?? ""),
    sealsVisible: String(row.seals_visible ?? ""),
    identifiedSeal: String(row.identified_seal ?? ""),
    qrPresent: String(row.qr_present ?? ""),
    qrFunctional: String(row.qr_functional ?? ""),
    satVerification: String(row.sat_verification ?? ""),
    satResult: String(row.sat_result ?? ""),
    documentQuality: (row.document_quality as SourceInvoice["documentQuality"]) ?? "",
    dictamen: String(row.dictamen ?? ""),
    qualityReasons: Array.isArray(row.quality_reasons)
      ? (row.quality_reasons as SourceInvoice["qualityReasons"])
      : [],
    qualityNotes: String(row.quality_notes ?? ""),
    createdAt: String(row.created_at ?? nowIso()),
  };
}

async function supabaseSnapshot(): Promise<StoreSnapshot> {
  const client = getAgenciesClient();
  if (!client) return localList();
  const { groupsTable, agenciesTable, sourceInvoicesTable, groupHistoryTable } = passConfig.agencies;

  const [groupsRes, agenciesRes, sourcesRes, historyRes] = await Promise.all([
    client.from(groupsTable).select("*").order("name"),
    client.from(agenciesTable).select("*").order("name"),
    client.from(sourceInvoicesTable).select("*"),
    client.from(groupHistoryTable).select("*"),
  ]);

  if (groupsRes.error || agenciesRes.error || sourcesRes.error) {
    const err = groupsRes.error || agenciesRes.error || sourcesRes.error;
    const message = err?.message || "";
    if (/invalid api key/i.test(message)) {
      throw new Error(
        "Pass rechazó la API key de este proyecto. Copia la secret con el botón Copy (no de una captura) o pega la JWT service_role de Legacy API keys.",
      );
    }
    throw new Error(err?.message || "No pudimos leer Pass.");
  }

  const sources = (sourcesRes.data ?? []).map((r) => rowToSource(r as Record<string, unknown>));
  const byAgency = new Map<string, SourceInvoice[]>();
  for (const s of sources) {
    const list = byAgency.get(s.agencyId) ?? [];
    list.push(s);
    byAgency.set(s.agencyId, list);
  }

  const history = historyRes.error
    ? []
    : (historyRes.data ?? []).map((r) => rowToHistory(r as Record<string, unknown>));
  const historyByAgency = new Map<string, AgencyGroupHistory[]>();
  for (const h of history) {
    const list = historyByAgency.get(h.agencyId) ?? [];
    list.push(h);
    historyByAgency.set(h.agencyId, list);
  }

  return {
    groups: (groupsRes.data ?? []).map((r) => rowToGroup(r as Record<string, unknown>)),
    agencies: (agenciesRes.data ?? []).map((r) => {
      const id = String((r as { id: string }).id);
      return rowToAgency(r as Record<string, unknown>, byAgency.get(id) ?? [], historyByAgency.get(id) ?? []);
    }),
  };
}

export async function listCatalog(): Promise<StoreSnapshot> {
  await connection();
  if (agenciesBackend() === "local") return localList();
  return supabaseSnapshot();
}

export async function listGroups() {
  const { groups } = await listCatalog();
  return groups;
}

export async function getAgency(id: string) {
  const { agencies } = await listCatalog();
  return agencies.find((a) => a.id === id) ?? null;
}

export async function saveGroup(input: { id?: string; name: string; brands?: string[]; notes?: string }) {
  const name = input.name.trim();
  const extraBrands = (input.brands ?? []).map((b) => b.trim()).filter(Boolean);

  if (agenciesBackend() === "local") {
    requireWritableStore();
    const { groups } = await localList();
    const existing = !input.id
      ? groups.find((g) => g.name.toLowerCase() === name.toLowerCase())
      : groups.find((g) => g.id === input.id);
    const group: AutomotiveGroup = existing
      ? {
          ...existing,
          brands: Array.from(new Set([...existing.brands, ...extraBrands])),
          notes: input.notes ?? existing.notes,
          updatedAt: nowIso(),
        }
      : {
          id: input.id ?? crypto.randomUUID(),
          name,
          brands: extraBrands,
          notes: input.notes ?? "",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
    const saved = await localSaveGroup(group);
    bustCatalogCache();
    return saved;
  }

  const client = getAgenciesClient();
  if (!client) {
    requireWritableStore();
    const saved = await localSaveGroup({
      id: input.id ?? crypto.randomUUID(),
      name,
      brands: extraBrands,
      notes: input.notes ?? "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    bustCatalogCache();
    return saved;
  }

  const { groupsTable } = passConfig.agencies;
  if (!input.id) {
    const { data: rows } = await client.from(groupsTable).select("*").ilike("name", name).limit(8);
    const match = (rows ?? []).find(
      (r) => String((r as { name?: string }).name ?? "").toLowerCase() === name.toLowerCase(),
    );
    if (match) {
      const group = rowToGroup(match as Record<string, unknown>);
      const brands = Array.from(new Set([...group.brands, ...extraBrands]));
      if (brands.length !== group.brands.length) {
        const { error } = await client
          .from(groupsTable)
          .update({ brands, updated_at: nowIso() })
          .eq("id", group.id);
        if (error) throw new Error(error.message);
        group.brands = brands;
        group.updatedAt = nowIso();
      }
      bustCatalogCache();
      return group;
    }
  }

  const group: AutomotiveGroup = {
    id: input.id ?? crypto.randomUUID(),
    name,
    brands: extraBrands,
    notes: input.notes ?? "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const { error } = await client.from(groupsTable).upsert({
    id: group.id,
    name: group.name,
    brands: group.brands,
    notes: group.notes,
    updated_at: group.updatedAt,
  });
  if (error) throw new Error(error.message);
  bustCatalogCache();
  return group;
}

export async function saveAgency(input: AgencyInput) {
  const existing = input.id ? await getAgency(input.id) : undefined;
  const agency = assembleAgency(input, existing ?? undefined);

  if (!agency.name) {
    throw new Error("El nombre de la agencia es el ancla de la ficha.");
  }

  if (agenciesBackend() === "local") {
    requireWritableStore();
    const saved = await localSaveAgency(agency);
    bustCatalogCache(agency.id);
    return saved;
  }

  const client = getAgenciesClient();
  if (!client) {
    requireWritableStore();
    const saved = await localSaveAgency(agency);
    bustCatalogCache(agency.id);
    return saved;
  }

  const groupId = asUuid(agency.groupId);
  if (!groupId) {
    throw new Error("La ficha necesita un grupo automotriz. Elígelo o créalo antes de guardar.");
  }

  const { agenciesTable, sourceInvoicesTable, groupHistoryTable } = passConfig.agencies;
  const payload = {
    id: agency.id,
    group_id: groupId,
    name: agency.name,
    brand: agency.brand,
    legal_name: agency.legalName,
    rfc: agency.rfc,
    emitter_number: agency.emitterNumber,
    email: agency.email,
    phone: agency.phone,
    address: agency.address,
    city: agency.city,
    municipality: agency.municipality,
    state: agency.state,
    postal_code: agency.postalCode,
    location: agency.location,
    maps_url: agency.mapsUrl,
    maps_place_name: agency.mapsPlaceName,
    maps_lat: agency.mapsLat,
    maps_lng: agency.mapsLng,
    notes: agency.notes,
    status: agency.status,
    updated_at: agency.updatedAt,
  };
  let { error } = await client.from(agenciesTable).upsert(payload);
  if (error && /maps_url|maps_place_name|maps_lat|maps_lng/i.test(error.message)) {
    const { maps_url: _u, maps_place_name: _n, maps_lat: _la, maps_lng: _ln, ...legacy } = payload;
    ({ error } = await client.from(agenciesTable).upsert(legacy));
  }
  if (error) throw new Error(error.message);

  await client.from(sourceInvoicesTable).delete().eq("agency_id", agency.id);
  if (agency.sources.length) {
    const { error: srcError } = await client.from(sourceInvoicesTable).insert(
      agency.sources.map((s) => ({
        id: s.id,
        agency_id: agency.id,
        invoice_id: s.invoiceId,
        file_url: s.fileUrl,
        vehicle_id: s.vehicleId,
        file_id: s.fileId,
        label: s.label,
        document_type: s.documentType,
        uuid: s.uuid,
        internal_folio: s.internalFolio,
        invoice_date: s.invoiceDate || null,
        rfc_receptor: s.rfcReceptor,
        total: s.total,
        has_signature: s.hasSignature,
        signature_type: s.signatureType,
        seals_visible: s.sealsVisible,
        identified_seal: s.identifiedSeal,
        qr_present: s.qrPresent,
        qr_functional: s.qrFunctional,
        sat_verification: s.satVerification,
        sat_result: s.satResult,
        document_quality: s.documentQuality,
        dictamen: s.dictamen,
        quality_reasons: s.qualityReasons,
        quality_notes: s.qualityNotes,
      })),
    );
    if (srcError) throw new Error(srcError.message);
  }

  const historyDelete = await client.from(groupHistoryTable).delete().eq("agency_id", agency.id);
  if (!historyDelete.error) {
    const rows = agency.groupHistory.filter((h) => h.groupId && h.groupId !== groupId);
    if (rows.length) {
      const { error: histError } = await client.from(groupHistoryTable).insert(
        rows.map((h) => ({
          id: h.id,
          agency_id: agency.id,
          group_id: h.groupId,
          brand: h.brand,
          note: h.note,
          recorded_at: h.recordedAt,
        })),
      );
      if (histError) throw new Error(histError.message);
    }
  }

  bustCatalogCache(agency.id);
  return { ...agency, groupId };
}

export async function deleteAgency(id: string) {
  if (agenciesBackend() === "local") {
    requireWritableStore();
    await localDeleteAgency(id);
    bustCatalogCache(id);
    return;
  }
  const client = getAgenciesClient();
  if (!client) {
    requireWritableStore();
    await localDeleteAgency(id);
    bustCatalogCache(id);
    return;
  }
  const { error } = await client.from(passConfig.agencies.agenciesTable).delete().eq("id", id);
  if (error) throw new Error(error.message);
  bustCatalogCache(id);
}

export async function findByRfc(rfc: string, exceptId?: string) {
  const clean = rfc.replace(/[\s-]/g, "").toUpperCase();
  if (!clean) return [];
  const { agencies } = await listCatalog();
  return agencies.filter((a) => a.rfc === clean && a.id !== exceptId);
}
