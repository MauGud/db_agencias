"use client";

import * as React from "react";
import {
  ArrowSquareOut,
  FilePdf,
  FloppyDisk,
  Image as ImageIcon,
  LinkSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { parseInvoiceStorageUrl } from "@/lib/pass/invoice-url";
import {
  migrateIdentifiedSeal,
  satForcesFake,
  syncInvoiceFlags,
  tagVariant,
  type YesNo,
} from "@/lib/pass/invoice-flags";
import { QUALITY_REASONS, type QualityReason, type SourceInvoice } from "@/lib/pass/types";
import { cn } from "@/lib/utils";

export type SourceDraft = Omit<SourceInvoice, "id" | "agencyId" | "createdAt"> & { id?: string };

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
    signatureLocation: "",
    sealsVisible: "",
    identifiedSeal: "",
    sealLocation: "",
    qrPresent: "",
    qrFunctional: "",
    satVerification: "",
    satResult: "",
    amda: false,
    amdaFound: "",
    amdaMatches: "",
    blacklisted: false,
    isFake: false,
    tags: [],
    documentQuality: "",
    dictamen: "",
    qualityReasons: [],
    qualityNotes: "",
  };
}

export function hydrateSourceDraft(partial?: Partial<SourceDraft>): SourceDraft {
  const seal = migrateIdentifiedSeal(partial?.identifiedSeal ?? "", partial?.sealLocation ?? "");
  return syncInvoiceFlags({
    ...blankSource(),
    ...partial,
    ...seal,
    amda: Boolean(partial?.amda),
    blacklisted: Boolean(partial?.blacklisted),
    isFake: Boolean(partial?.isFake),
    tags: Array.isArray(partial?.tags) ? partial.tags : [],
    qualityReasons: partial?.qualityReasons ?? [],
  });
}

function YesNoSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: YesNo) => void;
}) {
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : (v as YesNo))}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Elige" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sin definir</SelectItem>
        <SelectItem value="Sí">Sí</SelectItem>
        <SelectItem value="No">No</SelectItem>
      </SelectContent>
    </Select>
  );
}

function FlagCheck({
  id,
  checked,
  disabled,
  label,
  hint,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  hint?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border border-border p-4",
        disabled && "cursor-not-allowed opacity-80",
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        className="mt-0.5"
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

export function InvoiceSourceCard({
  source,
  index,
  saving,
  onChange,
  onRemove,
}: {
  source: SourceDraft;
  index: number;
  saving?: boolean;
  onChange: (next: SourceDraft) => void;
  onRemove: () => void;
}) {
  const [searching, setSearching] = React.useState(false);
  const parsed = source.fileUrl ? parseInvoiceStorageUrl(source.fileUrl) : null;
  const isImage = /\.(jpe?g|png|webp)$/i.test(source.fileUrl);
  const satLockedFake = satForcesFake(source.satVerification, source.satResult);

  function patch(next: Partial<SourceDraft>) {
    const merged = { ...source, ...next };
    if (satForcesFake(merged.satVerification, merged.satResult)) {
      merged.isFake = true;
    }
    onChange(syncInvoiceFlags(merged));
  }

  async function lookup() {
    const q = source.fileUrl.trim() || source.uuid.trim();
    if (!q) {
      toast("Pega el URL de la factura para buscarla.");
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
        patch({
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
      patch({
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
    patch({
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
          {source.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {source.tags.map((tag) => (
                <Badge key={tag} variant={tagVariant(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Quitar factura origen" onClick={onRemove}>
          <Trash weight="fill" />
        </Button>
      </div>

      <div className="grid gap-6">
        <Field
          id={`fileUrl-${index}`}
          label="URL de la factura"
          hint="Pega el link de Storage. En fase 2 este campo consulta la base de Nexcar."
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkSimple className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`fileUrl-${index}`}
                className="pl-9 font-mono text-xs"
                placeholder="https://….supabase.co/storage/v1/object/public/vehicles/prod/…"
                value={source.fileUrl}
                onChange={(e) => patch({ fileUrl: e.target.value })}
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
              onChange={(e) => patch({ label: e.target.value })}
            />
          </Field>
          <Field id={`docType-${index}`} label="Tipo de documento">
            <Select
              value={source.documentType || "none"}
              onValueChange={(v) => patch({ documentType: v === "none" ? "" : (v as SourceDraft["documentType"]) })}
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
          <Field id={`quality-${index}`} label="Calidad del documento">
            <Select
              value={source.documentQuality || "none"}
              onValueChange={(v) =>
                patch({
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

        <div className="grid gap-6 sm:grid-cols-3">
          <Field id={`sig-${index}`} label="¿Tiene firma?">
            <YesNoSelect id={`sig-${index}`} value={source.hasSignature} onChange={(hasSignature) => patch({ hasSignature })} />
          </Field>
          <Field id={`sigType-${index}`} label="Tipo de firma">
            <Input
              id={`sigType-${index}`}
              placeholder="Firma autógrafa"
              value={source.signatureType}
              onChange={(e) => patch({ signatureType: e.target.value })}
            />
          </Field>
          <Field id={`sigLoc-${index}`} label="¿Dónde se ubica?">
            <Input
              id={`sigLoc-${index}`}
              placeholder="Pie de página, recuadro izquierdo…"
              value={source.signatureLocation}
              onChange={(e) => patch({ signatureLocation: e.target.value })}
            />
          </Field>
          <Field id={`seals-${index}`} label="Sellos visibles">
            <YesNoSelect
              id={`seals-${index}`}
              value={source.sealsVisible}
              onChange={(sealsVisible) => patch({ sealsVisible })}
            />
          </Field>
          <Field id={`sealId-${index}`} label="Sello identificado">
            <YesNoSelect
              id={`sealId-${index}`}
              value={source.identifiedSeal}
              onChange={(identifiedSeal) => patch({ identifiedSeal })}
            />
          </Field>
          <Field id={`sealLoc-${index}`} label="¿Dónde se ubica?">
            <Input
              id={`sealLoc-${index}`}
              placeholder="Sello SAT, membrete, folio…"
              value={source.sealLocation}
              onChange={(e) => patch({ sealLocation: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`qr-${index}`} label="QR">
            <Input
              id={`qr-${index}`}
              placeholder="Sí"
              value={source.qrPresent}
              onChange={(e) => patch({ qrPresent: e.target.value })}
            />
          </Field>
          <Field id={`qrFn-${index}`} label="QR funcional">
            <Input
              id={`qrFn-${index}`}
              placeholder="Sí / No / Fraude"
              value={source.qrFunctional}
              onChange={(e) => patch({ qrFunctional: e.target.value })}
            />
          </Field>
          <Field id={`sat-${index}`} label="Verificación SAT">
            <YesNoSelect
              id={`sat-${index}`}
              value={source.satVerification}
              onChange={(satVerification) => patch({ satVerification })}
            />
          </Field>
          <Field id={`satRes-${index}`} label="¿El resultado en el SAT coincide?">
            <YesNoSelect id={`satRes-${index}`} value={source.satResult} onChange={(satResult) => patch({ satResult })} />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FlagCheck
            id={`amda-${index}`}
            checked={source.amda}
            label="Factura AMDA"
            hint="Si se marca, aparecen las validaciones de AMDA y la etiqueta AMDA."
            onCheckedChange={(checked) =>
              patch({
                amda: checked,
                amdaFound: checked ? source.amdaFound : "",
                amdaMatches: checked ? source.amdaMatches : "",
              })
            }
          />
          <FlagCheck
            id={`blacklist-${index}`}
            checked={source.blacklisted}
            label="Lista negra"
            hint="Marca la factura y genera la etiqueta Lista negra."
            onCheckedChange={(checked) => patch({ blacklisted: checked })}
          />
          <FlagCheck
            id={`fake-${index}`}
            checked={source.isFake}
            disabled={satLockedFake}
            label="Falsa"
            hint={
              satLockedFake
                ? "Se marcó sola porque la verificación SAT o la coincidencia en el SAT es No."
                : "Se marca sola si la verificación SAT o la coincidencia en el SAT es No."
            }
            onCheckedChange={(checked) => {
              if (!checked && satLockedFake) {
                toast("No se puede quitar Falsa mientras la verificación SAT o la coincidencia sea No.");
                return;
              }
              patch({ isFake: checked });
            }}
          />
        </div>

        {source.amda ? (
          <div className="grid gap-6 rounded-md border border-border p-4 sm:grid-cols-2">
            <Field id={`amdaFound-${index}`} label="Factura encontrada en AMDA">
              <YesNoSelect
                id={`amdaFound-${index}`}
                value={source.amdaFound}
                onChange={(amdaFound) => patch({ amdaFound })}
              />
            </Field>
            <Field id={`amdaMatches-${index}`} label="¿El resultado del sitio coincide con los datos?">
              <YesNoSelect
                id={`amdaMatches-${index}`}
                value={source.amdaMatches}
                onChange={(amdaMatches) => patch({ amdaMatches })}
              />
            </Field>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field id={`dictamen-${index}`} label="Dictamen de la factura origen" className="flex-1">
            <Textarea
              id={`dictamen-${index}`}
              placeholder="Buena / Mala calidad / lo que observaste al leerla"
              value={source.dictamen}
              onChange={(e) => patch({ dictamen: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={saving} className="shrink-0">
            <FloppyDisk weight="fill" />
            {saving ? "Guardando…" : "Guardar ficha"}
          </Button>
        </div>

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
