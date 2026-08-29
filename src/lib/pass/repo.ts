import { agenciesBackend, passConfig } from "./config";
import { deriveStatus } from "./completeness";
import { localDeleteAgency, localList, localSaveAgency, localSaveGroup } from "./local-store";
import { getAgenciesClient } from "./supabase";
import type { Agency, AgencyInput, AutomotiveGroup, SourceInvoice, StoreSnapshot } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function emptySource(agencyId: string, partial: AgencyInput["sources"][number]): SourceInvoice {
  return {
    id: crypto.randomUUID(),
    agencyId,
    invoiceId: partial.invoiceId ?? null,
    fileUrl: partial.fileUrl ?? "",
    vehicleId: partial.vehicleId ?? null,
    fileId: partial.fileId ?? null,
    label: partial.label ?? "",
    documentType: partial.documentType ?? "",
    uuid: partial.uuid ?? "",
    internalFolio: partial.internalFolio ?? "",
    invoiceDate: partial.invoiceDate ?? "",
    rfcReceptor: partial.rfcReceptor ?? "",
    total: partial.total ?? null,
    hasSignature: partial.hasSignature ?? "",
    signatureType: partial.signatureType ?? "",
    sealsVisible: partial.sealsVisible ?? "",
    identifiedSeal: partial.identifiedSeal ?? "",
    qrPresent: partial.qrPresent ?? "",
    qrFunctional: partial.qrFunctional ?? "",
    satVerification: partial.satVerification ?? "",
    satResult: partial.satResult ?? "",
    documentQuality: partial.documentQuality ?? "",
    dictamen: partial.dictamen ?? "",
    qualityReasons: partial.qualityReasons ?? [],
    qualityNotes: partial.qualityNotes ?? "",
    createdAt: nowIso(),
  };
}

function assembleAgency(input: AgencyInput, existing?: Agency): Agency {
  const id = input.id ?? existing?.id ?? crypto.randomUUID();
  const createdAt = existing?.createdAt ?? nowIso();
  const sources = (input.sources ?? []).map((s) =>
    emptySource(id, s),
  );
  const agency: Agency = {
    id,
    groupId: input.groupId,
    name: input.name.trim(),
    brand: input.brand.trim(),
    legalName: input.legalName.trim(),
    rfc: input.rfc.replace(/[\s-]/g, "").toUpperCase(),
    emitterNumber: input.emitterNumber.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    municipality: input.municipality.trim(),
    state: input.state.trim(),
    postalCode: input.postalCode.trim(),
    location: input.location.trim(),
    notes: input.notes.trim(),
    status: "draft",
    createdAt,
    updatedAt: nowIso(),
    sources,
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

function rowToAgency(row: Record<string, unknown>, sources: SourceInvoice[]): Agency {
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
    notes: String(row.notes ?? ""),
    status: (row.status as Agency["status"]) ?? "draft",
    createdAt: String(row.created_at ?? nowIso()),
    updatedAt: String(row.updated_at ?? nowIso()),
    sources,
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
  const { groupsTable, agenciesTable, sourceInvoicesTable } = passConfig.agencies;

  const [groupsRes, agenciesRes, sourcesRes] = await Promise.all([
    client.from(groupsTable).select("*").order("name"),
    client.from(agenciesTable).select("*").order("name"),
    client.from(sourceInvoicesTable).select("*"),
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

  return {
    groups: (groupsRes.data ?? []).map((r) => rowToGroup(r as Record<string, unknown>)),
    agencies: (agenciesRes.data ?? []).map((r) =>
      rowToAgency(r as Record<string, unknown>, byAgency.get(String((r as { id: string }).id)) ?? []),
    ),
  };
}

export async function listCatalog(): Promise<StoreSnapshot> {
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
  const group: AutomotiveGroup = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name.trim(),
    brands: input.brands ?? [],
    notes: input.notes ?? "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (agenciesBackend() === "local") return localSaveGroup(group);

  const client = getAgenciesClient();
  if (!client) return localSaveGroup(group);
  const { error } = await client.from(passConfig.agencies.groupsTable).upsert({
    id: group.id,
    name: group.name,
    brands: group.brands,
    notes: group.notes,
    updated_at: group.updatedAt,
  });
  if (error) throw new Error(error.message);
  return group;
}

export async function saveAgency(input: AgencyInput) {
  const existing = input.id ? await getAgency(input.id) : undefined;
  const agency = assembleAgency(input, existing ?? undefined);

  if (agenciesBackend() === "local") return localSaveAgency(agency);

  const client = getAgenciesClient();
  if (!client) return localSaveAgency(agency);

  const { agenciesTable, sourceInvoicesTable } = passConfig.agencies;
  const { error } = await client.from(agenciesTable).upsert({
    id: agency.id,
    group_id: agency.groupId,
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
    notes: agency.notes,
    status: agency.status,
    updated_at: agency.updatedAt,
  });
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

  return agency;
}

export async function deleteAgency(id: string) {
  if (agenciesBackend() === "local") return localDeleteAgency(id);
  const client = getAgenciesClient();
  if (!client) return localDeleteAgency(id);
  const { error } = await client.from(passConfig.agencies.agenciesTable).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function findByRfc(rfc: string, exceptId?: string) {
  const clean = rfc.replace(/[\s-]/g, "").toUpperCase();
  if (!clean) return [];
  const { agencies } = await listCatalog();
  return agencies.filter((a) => a.rfc === clean && a.id !== exceptId);
}
