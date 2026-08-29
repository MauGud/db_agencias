"use client";

import * as React from "react";
import {
  ArrowSquareOut,
  FilePdf,
  Image as ImageIcon,
  LinkSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { parseInvoiceStorageUrl } from "@/lib/pass/invoice-url";
import { QUALITY_REASONS, type QualityReason, type SourceInvoice } from "@/lib/pass/types";
import { cn } from "@/lib/utils";

export type SourceDraft = Omit<SourceInvoice, "id" | "agencyId" | "createdAt">;

export function blankSource(): SourceDraft {
  return {
    invoiceId: null,
    fileUrl: "",
    vehicleId: null,
    fileId: null,
    label: "",
    documentType: "",
    uuid: "",
    internalFolio: "",
    invoiceDate: "",
    rfcReceptor: "",
    total: null,
    hasSignature: "",
    signatureType: "",
    sealsVisible: "",
    identifiedSeal: "",
    qrPresent: "",
    qrFunctional: "",
    satVerification: "",
    satResult: "",
    documentQuality: "",
    dictamen: "",
    qualityReasons: [],
    qualityNotes: "",
  };
}

export function InvoiceSourceCard({
  source,
  index,
  onChange,
  onRemove,
}: {
  source: SourceDraft;
  index: number;
  onChange: (next: SourceDraft) => void;
  onRemove: () => void;
}) {
  const [searching, setSearching] = React.useState(false);
  const parsed = source.fileUrl ? parseInvoiceStorageUrl(source.fileUrl) : null;
  const isImage = /\.(jpe?g|png|webp)$/i.test(source.fileUrl);

  async function lookup() {
    const q = source.fileUrl.trim() || source.uuid.trim();
    if (!q) {
      toast("Pega el URL de la factura o el UUID para buscarla.");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/invoices/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as {
        configured: boolean;
        results: { id: string; fileUrl: string; vehicleId: string | null }[];
      };
      const fromUrl = parseInvoiceStorageUrl(q);
      if (fromUrl) {
        onChange({
          ...source,
          fileUrl: fromUrl.fileUrl,
          vehicleId: fromUrl.vehicleId,
          fileId: fromUrl.fileId,
          documentType: source.documentType || (fromUrl.extension === "pdf" ? "PDF" : "Foto"),
        });
      }
      if (!data.configured) {
        toast("El URL quedó ligado. Pass de facturas aún no tiene keys — el cruce a `invoice` se activa al conectarlas.");
        return;
      }
      const hit = data.results[0];
      if (!hit) {
        toast("No encontramos esa factura en documentos analizados. El URL se conserva para cruzarlo después.");
        return;
      }
      onChange({
        ...source,
        invoiceId: hit.id,
        fileUrl: hit.fileUrl || source.fileUrl,
        vehicleId: hit.vehicleId,
        fileId: fromUrl?.fileId ?? source.fileId,
      });
      toast("Factura ligada a documentos analizados.");
    } catch {
      toast("No pudimos consultar las facturas. Intenta de nuevo.");
    } finally {
      setSearching(false);
    }
  }

  function toggleReason(reason: QualityReason) {
    const has = source.qualityReasons.includes(reason);
    onChange({
      ...source,
      qualityReasons: has
        ? source.qualityReasons.filter((r) => r !== reason)
        : [...source.qualityReasons, reason],
    });
  }

  return (
    <div className="rounded-lg border border-border p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Factura origen {index + 1}</p>
          <p className="text-sm text-muted-foreground">
            El documento que llevó a esta agencia. Se cruza con la tabla de documentos analizados (`invoice`).
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Quitar factura origen" onClick={onRemove}>
          <Trash weight="fill" />
        </Button>
      </div>

      <div className="grid gap-6">
        <Field
          id={`fileUrl-${index}`}
          label="URL de la factura"
          hint="Pega el link de Storage o busca por UUID. En fase 2 este campo consulta la base de Nexcar."
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkSimple className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`fileUrl-${index}`}
                className="pl-9 font-mono text-xs"
                placeholder="https://….supabase.co/storage/v1/object/public/vehicles/prod/…"
                value={source.fileUrl}
                onChange={(e) => onChange({ ...source, fileUrl: e.target.value })}
              />
            </div>
            <Button type="button" variant="outline" onClick={lookup} disabled={searching}>
              {searching ? "Buscando…" : "Ligar factura"}
            </Button>
          </div>
        </Field>

        {parsed ? (
          <dl className="grid grid-cols-2 gap-3 rounded-md bg-muted p-4 font-mono text-xs">
            <div>
              <dt className="text-muted-foreground">vehicle_id</dt>
              <dd className="mt-1 break-all">{parsed.vehicleId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">file_id</dt>
              <dd className="mt-1 break-all">{parsed.fileId}</dd>
            </div>
            {source.invoiceId ? (
              <div className="col-span-2">
                <dt className="text-muted-foreground">invoice_id</dt>
                <dd className="mt-1">{source.invoiceId}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {source.fileUrl ? (
          <div className="overflow-hidden rounded-md border border-border bg-muted">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                {isImage ? <ImageIcon weight="fill" className="size-4" /> : <FilePdf weight="fill" className="size-4" />}
                Vista del documento
              </span>
              <a
                href={source.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary"
              >
                Abrir original
                <ArrowSquareOut className="size-3.5" />
              </a>
            </div>
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={source.fileUrl} alt="Factura origen" className="max-h-80 w-full object-contain bg-background" />
            ) : (
              <iframe title="Factura origen" src={source.fileUrl} className="h-80 w-full bg-background" />
            )}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`label-${index}`} label="Etiqueta">
            <Input
              id={`label-${index}`}
              placeholder="Factura 12"
              value={source.label}
              onChange={(e) => onChange({ ...source, label: e.target.value })}
            />
          </Field>
          <Field id={`docType-${index}`} label="Tipo de documento">
            <Select
              value={source.documentType || "none"}
              onValueChange={(v) =>
                onChange({ ...source, documentType: v === "none" ? "" : (v as SourceDraft["documentType"]) })
              }
            >
              <SelectTrigger id={`docType-${index}`}>
                <SelectValue placeholder="Elige" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin definir</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Foto">Foto</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id={`uuid-${index}`} label="Folio fiscal / UUID" hint="Como aparece en el CFDI">
            <Input
              id={`uuid-${index}`}
              className="font-mono"
              placeholder="62C5D7E8-8A9A-41A3-831C-9F9BCB5132BD"
              value={source.uuid}
              onChange={(e) => onChange({ ...source, uuid: e.target.value })}
            />
          </Field>
          <Field id={`folio-${index}`} label="Folio interno">
            <Input
              id={`folio-${index}`}
              placeholder="UFE000002538"
              value={source.internalFolio}
              onChange={(e) => onChange({ ...source, internalFolio: e.target.value })}
            />
          </Field>
          <Field id={`date-${index}`} label="Fecha factura">
            <Input
              id={`date-${index}`}
              type="date"
              value={source.invoiceDate}
              onChange={(e) => onChange({ ...source, invoiceDate: e.target.value })}
            />
          </Field>
          <Field id={`rfcRec-${index}`} label="RFC receptor">
            <Input
              id={`rfcRec-${index}`}
              className="font-mono"
              placeholder="XAXX010101000"
              value={source.rfcReceptor}
              onChange={(e) => onChange({ ...source, rfcReceptor: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field id={`total-${index}`} label="Total">
            <Input
              id={`total-${index}`}
              type="number"
              step="0.01"
              placeholder="548500"
              value={source.total ?? ""}
              onChange={(e) =>
                onChange({
                  ...source,
                  total: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
          <Field id={`quality-${index}`} label="Calidad del documento">
            <Select
              value={source.documentQuality || "none"}
              onValueChange={(v) =>
                onChange({
                  ...source,
                  documentQuality: v === "none" ? "" : (v as SourceDraft["documentQuality"]),
                })
              }
            >
              <SelectTrigger id={`quality-${index}`}>
                <SelectValue placeholder="Elige" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin definir</SelectItem>
                <SelectItem value="Buena">Buena</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Mala">Mala</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`sig-${index}`} label="¿Tiene firma?">
            <Input
              id={`sig-${index}`}
              placeholder="Sí / No visible"
              value={source.hasSignature}
              onChange={(e) => onChange({ ...source, hasSignature: e.target.value })}
            />
          </Field>
          <Field id={`sigType-${index}`} label="Tipo de firma">
            <Input
              id={`sigType-${index}`}
              placeholder="Firma autógrafa"
              value={source.signatureType}
              onChange={(e) => onChange({ ...source, signatureType: e.target.value })}
            />
          </Field>
          <Field id={`seals-${index}`} label="Sellos visibles">
            <Input
              id={`seals-${index}`}
              placeholder="Sí"
              value={source.sealsVisible}
              onChange={(e) => onChange({ ...source, sealsVisible: e.target.value })}
            />
          </Field>
          <Field id={`sealId-${index}`} label="Sello identificado">
            <Input
              id={`sealId-${index}`}
              value={source.identifiedSeal}
              onChange={(e) => onChange({ ...source, identifiedSeal: e.target.value })}
            />
          </Field>
          <Field id={`qr-${index}`} label="QR">
            <Input
              id={`qr-${index}`}
              placeholder="Sí"
              value={source.qrPresent}
              onChange={(e) => onChange({ ...source, qrPresent: e.target.value })}
            />
          </Field>
          <Field id={`qrFn-${index}`} label="QR funcional">
            <Input
              id={`qrFn-${index}`}
              placeholder="Sí / No / Fraude"
              value={source.qrFunctional}
              onChange={(e) => onChange({ ...source, qrFunctional: e.target.value })}
            />
          </Field>
          <Field id={`sat-${index}`} label="Verificación SAT">
            <Input
              id={`sat-${index}`}
              value={source.satVerification}
              onChange={(e) => onChange({ ...source, satVerification: e.target.value })}
            />
          </Field>
          <Field id={`satRes-${index}`} label="Resultado SAT">
            <Input
              id={`satRes-${index}`}
              value={source.satResult}
              onChange={(e) => onChange({ ...source, satResult: e.target.value })}
            />
          </Field>
        </div>

        <Field id={`dictamen-${index}`} label="Dictamen de la factura origen">
          <Textarea
            id={`dictamen-${index}`}
            placeholder="Buena / Mala calidad / lo que observaste al leerla"
            value={source.dictamen}
            onChange={(e) => onChange({ ...source, dictamen: e.target.value })}
          />
        </Field>

        {source.documentQuality === "Mala" || source.documentQuality === "Regular" ? (
          <div className="flex flex-col gap-3">
            <Label>¿Por qué no es contundente?</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUALITY_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={source.qualityReasons.includes(reason)}
                    onCheckedChange={() => toggleReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AddSourceButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className={cn(className)}>
      <Plus weight="fill" />
      Agregar factura origen
    </Button>
  );
}
