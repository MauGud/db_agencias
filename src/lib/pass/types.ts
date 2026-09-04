export type DocumentKind = "PDF" | "Foto";

export type DocumentQuality = "Buena" | "Regular" | "Mala" | "";

export type AgencyStatus = "draft" | "ready" | "needs_review";

export type QualityReason =
  | "RFC incorrecto"
  | "UUID no localizado"
  | "QR no funcional"
  | "Datos fiscales inconsistentes"
  | "Sello faltante"
  | "Firma faltante"
  | "Documento ilegible"
  | "Información incompleta"
  | "Datos que no coinciden"
  | "No se pudo verificar"
  | "Otro";

export const QUALITY_REASONS: QualityReason[] = [
  "RFC incorrecto",
  "UUID no localizado",
  "QR no funcional",
  "Datos fiscales inconsistentes",
  "Sello faltante",
  "Firma faltante",
  "Documento ilegible",
  "Información incompleta",
  "Datos que no coinciden",
  "No se pudo verificar",
  "Otro",
];

export type AutomotiveGroup = {
  id: string;
  name: string;
  brands: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Factura que originó o confirma la ficha. Se liga a la tabla de documentos
 * analizados (`invoice`) vía URL de storage y, cuando existe, `invoiceId`.
 */
export type SourceInvoice = {
  id: string;
  agencyId: string;
  /** UUID en la tabla de documentos analizados, cuando el cruce ya existe. */
  invoiceId: string | null;
  /** URL pública de Storage — el link de la hoja de cálculo. */
  fileUrl: string;
  vehicleId: string | null;
  fileId: string | null;
  label: string;
  documentType: DocumentKind | "";
  uuid: string;
  internalFolio: string;
  invoiceDate: string;
  rfcReceptor: string;
  total: number | null;
  hasSignature: string;
  signatureType: string;
  sealsVisible: string;
  identifiedSeal: string;
  qrPresent: string;
  qrFunctional: string;
  satVerification: string;
  satResult: string;
  documentQuality: DocumentQuality;
  dictamen: string;
  qualityReasons: QualityReason[];
  qualityNotes: string;
  createdAt: string;
};

export type AgencyGroupHistory = {
  id: string;
  agencyId: string;
  groupId: string;
  brand: string;
  note: string;
  recordedAt: string;
};

export type Agency = {
  id: string;
  groupId: string;
  name: string;
  brand: string;
  legalName: string;
  rfc: string;
  emitterNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  municipality: string;
  state: string;
  postalCode: string;
  /** Derivada de municipio / ciudad / estado. Ya no se captura a mano. */
  location: string;
  mapsUrl: string;
  mapsPlaceName: string;
  mapsLat: number | null;
  mapsLng: number | null;
  notes: string;
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
  sources: SourceInvoice[];
  /** Grupos / marcas que esta agencia vendió antes del grupo actual. */
  groupHistory: AgencyGroupHistory[];
};

export type AgencyInput = Omit<Agency, "id" | "createdAt" | "updatedAt" | "status" | "sources" | "groupHistory"> & {
  id?: string;
  sources: Array<Omit<SourceInvoice, "id" | "agencyId" | "createdAt"> & { id?: string }>;
  groupHistory?: Array<Omit<AgencyGroupHistory, "agencyId"> & { id?: string; agencyId?: string }>;
};

export type StoreSnapshot = {
  groups: AutomotiveGroup[];
  agencies: Agency[];
};

export type InvoiceRecord = {
  id: string;
  fileUrl: string;
  vehicleId: string | null;
  type: string;
  raw: Record<string, unknown>;
};

export type ParsedInvoiceUrl = {
  fileUrl: string;
  bucket: string;
  storageEnv: string;
  vehicleId: string;
  fileId: string;
  extension: string;
};
