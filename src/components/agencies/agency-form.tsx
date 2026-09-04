"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, FloppyDisk } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AgencyGroupHistoryPanel } from "@/components/agencies/group-history-panel";
import {
  AddSourceButton,
  InvoiceSourceCard,
  blankSource,
  type SourceDraft,
} from "@/components/agencies/invoice-source-card";
import { AgencyMapsCard } from "@/components/agencies/maps-card";
import { StatusPill } from "@/components/composed/status-pill";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { composedLocation, parseMexicanAddress } from "@/lib/mexico-address";
import { completenessItems, completenessScore, deriveStatus } from "@/lib/pass/completeness";
import type { Agency, AgencyGroupHistory, AutomotiveGroup } from "@/lib/pass/types";
import type { GeoResolveResult } from "@/lib/pass/places";
import { MEXICAN_STATES, rfcError } from "@/lib/mexico";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  groupId: string;
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
  mapsUrl: string;
  mapsPlaceName: string;
  mapsLat: number | null;
  mapsLng: number | null;
  mapsEmbedUrl: string;
  notes: string;
  sources: SourceDraft[];
  groupHistory: AgencyGroupHistory[];
};

function fromAgency(agency: Agency): FormState {
  return {
    name: agency.name,
    groupId: agency.groupId,
    brand: agency.brand,
    legalName: agency.legalName,
    rfc: agency.rfc,
    emitterNumber: agency.emitterNumber,
    email: agency.email,
    phone: agency.phone,
    address: agency.address,
    city: agency.city,
    municipality: agency.municipality,
    state: agency.state,
    postalCode: agency.postalCode,
    mapsUrl: agency.mapsUrl ?? "",
    mapsPlaceName: agency.mapsPlaceName ?? "",
    mapsLat: agency.mapsLat ?? null,
    mapsLng: agency.mapsLng ?? null,
    mapsEmbedUrl:
      agency.mapsLat != null && agency.mapsLng != null
        ? `https://www.google.com/maps?q=${agency.mapsLat},${agency.mapsLng}&z=16&output=embed`
        : agency.mapsUrl
          ? `https://www.google.com/maps?q=${encodeURIComponent(agency.name + " " + agency.address)}&output=embed`
          : "",
    notes: agency.notes,
    sources:
      agency.sources.length > 0
        ? agency.sources.map(({ agencyId: _a, createdAt: _c, ...rest }) => rest)
        : [blankSource()],
    groupHistory: agency.groupHistory ?? [],
  };
}

function emptyForm(groupId = ""): FormState {
  return {
    name: "",
    groupId,
    brand: "",
    legalName: "",
    rfc: "",
    emitterNumber: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    municipality: "",
    state: "",
    postalCode: "",
    mapsUrl: "",
    mapsPlaceName: "",
    mapsLat: null,
    mapsLng: null,
    mapsEmbedUrl: "",
    notes: "",
    sources: [blankSource()],
    groupHistory: [],
  };
}

export function AgencyForm({
  agency,
  groups: initialGroups,
  defaultGroupId,
}: {
  agency?: Agency;
  groups: AutomotiveGroup[];
  defaultGroupId?: string;
}) {
  const router = useRouter();
  const [groups, setGroups] = React.useState(initialGroups);
  const [form, setForm] = React.useState<FormState>(
    agency ? fromAgency(agency) : emptyForm(defaultGroupId ?? ""),
  );
  const [newGroup, setNewGroup] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [rfcHits, setRfcHits] = React.useState<{ id: string; name: string }[]>([]);
  const [geoLoading, setGeoLoading] = React.useState(false);
  const [geoReview, setGeoReview] = React.useState<{
    nameMismatch: boolean;
    reviewMessage: string | null;
  }>({ nameMismatch: false, reviewMessage: null });
  const submitRef = React.useRef<() => Promise<void>>(async () => {});
  const lastResolvedAddress = React.useRef(form.address);

  const previewAgency = {
    ...form,
    sources: form.sources.map((s, i) => ({
      ...s,
      id: String(i),
      agencyId: agency?.id ?? "",
      createdAt: "",
    })),
  };
  const items = completenessItems(previewAgency);
  const score = completenessScore(previewAgency);
  const status = deriveStatus(previewAgency);
  const rfcMsg = form.rfc ? rfcError(form.rfc) : null;

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void submitRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const rfc = form.rfc.replace(/[\s-]/g, "");
    if (rfc.length < 12) {
      setRfcHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/agencies?rfc=${encodeURIComponent(rfc)}`);
      const data = (await res.json()) as { agencies: { id: string; name: string }[] };
      setRfcHits((data.agencies ?? []).filter((a) => a.id !== agency?.id));
    }, 300);
    return () => clearTimeout(t);
  }, [form.rfc, agency?.id]);

  React.useEffect(() => {
    const name = form.name.trim();
    const address = form.address.trim();
    if (name.length < 3 && address.length < 8) {
      setGeoLoading(false);
      return;
    }
    const t = setTimeout(async () => {
      setGeoLoading(true);
      const addressChanged = address !== lastResolvedAddress.current;
      try {
        const res = await fetch("/api/geo/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, address }),
        });
        const data = (await res.json()) as GeoResolveResult & { error?: string };
        if (!res.ok || data.error) return;
        lastResolvedAddress.current = address;
        setForm((f) => ({
          ...f,
          state: addressChanged ? data.state || f.state : f.state || data.state,
          municipality: addressChanged ? data.municipality || f.municipality : f.municipality || data.municipality,
          city: addressChanged ? data.city || f.city : f.city || data.city,
          postalCode: addressChanged ? data.postalCode || f.postalCode : f.postalCode || data.postalCode,
          mapsUrl: data.mapsUrl || f.mapsUrl,
          mapsPlaceName: data.mapsPlaceName,
          mapsLat: data.mapsLat,
          mapsLng: data.mapsLng,
          mapsEmbedUrl: data.mapsEmbedUrl || f.mapsEmbedUrl,
        }));
        setGeoReview({
          nameMismatch: data.nameMismatch,
          reviewMessage: data.reviewMessage,
        });
      } catch {
        /* el mapa se arma igual con la búsqueda de Google */
      } finally {
        setGeoLoading(false);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [form.name, form.address]);

  function patch(partial: Partial<FormState>) {
    setForm((f) => ({ ...f, ...partial }));
  }

  async function createGroup(nameOverride?: string, assignCurrent = true, brands?: string[]) {
    const name = (nameOverride ?? newGroup).trim();
    if (!name) return null;
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        name,
        brands: brands ?? (form.brand ? [form.brand] : []),
      }),
    });
    const data = (await res.json()) as { group?: AutomotiveGroup; error?: string };
    if (!res.ok || !data.group) {
      toast(data.error ?? "No pudimos crear el grupo. Intenta de nuevo.");
      return null;
    }
    setGroups((g) => [...g, data.group!].sort((a, b) => a.name.localeCompare(b.name, "es")));
    if (assignCurrent) {
      patch({ groupId: data.group.id });
      setNewGroup("");
    }
    toast(`Grupo ${data.group.name} creado.`);
    return data.group;
  }

  async function submit() {
    if (!form.name.trim()) {
      toast("El nombre de la agencia es el ancla de la ficha.");
      return;
    }
    setSaving(true);
    try {
      let groupId = form.groupId;
      if (!groupId && newGroup.trim()) {
        const created = await createGroup();
        if (!created) return;
        groupId = created.id;
      }
      if (!groupId) {
        toast("Elige o crea un grupo automotriz. Cada ficha pertenece a un grupo.");
        return;
      }
      const { mapsEmbedUrl: _embed, ...rest } = form;
      const res = await fetch(agency ? `/api/agencies/${agency.id}` : "/api/agencies", {
        method: agency ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          ...rest,
          groupId,
          location: composedLocation({
            municipality: form.municipality,
            city: form.city,
            state: form.state,
          }),
        }),
      });
      const data = (await res.json()) as { agency?: Agency; error?: string };
      if (!res.ok || !data.agency) {
        toast(data.error ?? "No pudimos guardar la ficha. Intenta de nuevo.");
        return;
      }
      toast("Ficha guardada.");
      if (agency) {
        router.refresh();
      } else {
        router.push(`/agencias/${data.agency.id}`);
        router.refresh();
      }
    } catch {
      toast("Algo falló de nuestro lado. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }
  submitRef.current = submit;

  return (
    <form
      noValidate
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="caption text-muted-foreground">Ficha</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {agency ? agency.name : "Nueva agencia"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa primero identidad y ubicación. La factura origen documenta de dónde salió la ficha.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={status} />
            <Button type="submit" disabled={saving}>
              <FloppyDisk weight="fill" />
              {saving ? "Guardando…" : "Guardar ficha"}
            </Button>
          </div>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Identidad</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="name" label="Agencia" hint="Como se nombra en piso y en factura">
              <Input
                id="name"
                placeholder="Audi Center Toluca"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Field>
            <Field id="brand" label="Marca">
              <Input
                id="brand"
                placeholder="Audi"
                value={form.brand}
                onChange={(e) => patch({ brand: e.target.value })}
              />
            </Field>
            <Field
              id="group"
              label="Grupo automotriz"
              className="sm:col-span-2"
              hint="Obligatorio. Si escribes un nombre nuevo y guardas, se crea el grupo al vuelo."
            >
              <Select value={form.groupId || "none"} onValueChange={(v) => patch({ groupId: v === "none" ? "" : v })}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Elige un grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin grupo</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Nuevo grupo, ej. ALSEN"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={() => void createGroup()}>
                  Crear grupo
                </Button>
              </div>
            </Field>
            <AgencyGroupHistoryPanel
              groups={groups}
              currentGroupId={form.groupId}
              currentBrand={form.brand}
              history={form.groupHistory}
              onChange={(groupHistory) => patch({ groupHistory })}
              onCreateGroup={(name, brands) => createGroup(name, false, brands)}
            />
            <Field id="legalName" label="Nombre / razón social">
              <Input
                id="legalName"
                placeholder="ALSEN CENTER S.A. DE C.V."
                value={form.legalName}
                onChange={(e) => patch({ legalName: e.target.value })}
              />
            </Field>
            <Field
              id="rfc"
              label="RFC emisor"
              error={rfcMsg}
              hint={rfcHits.length ? `Este RFC ya está en ${rfcHits.map((h) => h.name).join(", ")}.` : "Como aparece en el CFDI"}
            >
              <Input
                id="rfc"
                className="font-mono"
                placeholder="ACE080909LI7"
                value={form.rfc}
                onChange={(e) => patch({ rfc: e.target.value.toUpperCase() })}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Ubicación</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="address"
              label="Dirección de la agencia"
              className="sm:col-span-2"
              hint="Pega la dirección de la factura. Estado, municipio, ciudad y CP se llenan solos."
            >
              <Input
                id="address"
                placeholder="Av. Presidente Masaryk No. 207, Col. Polanco, Miguel Hidalgo, Ciudad de México, 11560"
                value={form.address}
                onChange={(e) => {
                  const address = e.target.value;
                  const parsed = parseMexicanAddress(address);
                  patch({
                    address,
                    ...(parsed.state ? { state: parsed.state } : {}),
                    ...(parsed.municipality ? { municipality: parsed.municipality } : {}),
                    ...(parsed.city ? { city: parsed.city } : {}),
                    ...(parsed.postalCode ? { postalCode: parsed.postalCode } : {}),
                  });
                }}
              />
            </Field>
            <Field id="state" label="Estado">
              <Select value={form.state || "none"} onValueChange={(v) => patch({ state: v === "none" ? "" : v })}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Elige estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin definir</SelectItem>
                  {MEXICAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="municipality" label="Municipio / alcaldía">
              <Input
                id="municipality"
                placeholder="Miguel Hidalgo"
                value={form.municipality}
                onChange={(e) => patch({ municipality: e.target.value })}
              />
            </Field>
            <Field id="city" label="Ciudad">
              <Input
                id="city"
                placeholder="Ciudad de México"
                value={form.city}
                onChange={(e) => patch({ city: e.target.value })}
              />
            </Field>
            <Field id="postalCode" label="Código postal">
              <Input
                id="postalCode"
                inputMode="numeric"
                placeholder="11560"
                value={form.postalCode}
                onChange={(e) => patch({ postalCode: e.target.value })}
              />
            </Field>
            <AgencyMapsCard
              loading={geoLoading}
              mapsUrl={
                form.mapsUrl ||
                ([form.name, form.address].filter(Boolean).join(" ")
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [form.name, form.address].filter(Boolean).join(" "),
                    )}`
                  : "")
              }
              mapsEmbedUrl={
                form.mapsEmbedUrl ||
                ([form.name, form.address].filter(Boolean).join(" ")
                  ? `https://www.google.com/maps?q=${encodeURIComponent(
                      [form.name, form.address].filter(Boolean).join(" "),
                    )}&output=embed`
                  : "")
              }
              placeName={form.mapsPlaceName}
              nameMismatch={geoReview.nameMismatch}
              reviewMessage={geoReview.reviewMessage}
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Contacto</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="phone" label="Teléfono emisor">
              <Input
                id="phone"
                type="tel"
                placeholder="(229) 296 08 20"
                value={form.phone}
                onChange={(e) => patch({ phone: e.target.value })}
              />
            </Field>
            <Field id="email" label="Correo emisor">
              <Input
                id="email"
                type="email"
                placeholder="ventas@agencia.mx"
                value={form.email}
                onChange={(e) => patch({ email: e.target.value })}
              />
            </Field>
            <Field id="emitterNumber" label="Número de emisor">
              <Input
                id="emitterNumber"
                placeholder="2051"
                value={form.emitterNumber}
                onChange={(e) => patch({ emitterNumber: e.target.value })}
              />
            </Field>
            <Field id="notes" label="Notas" className="sm:col-span-2">
              <Textarea
                id="notes"
                placeholder="Cualquier detalle que ayude a cruzar facturas futuras"
                value={form.notes}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Factura origen</h2>
              <p className="text-sm text-muted-foreground">
                El documento analizado que descubrió esta agencia. Una ficha puede tener varias.
              </p>
            </div>
            <AddSourceButton onClick={() => patch({ sources: [...form.sources, blankSource()] })} />
          </div>
          {form.sources.map((source, index) => (
            <InvoiceSourceCard
              key={index}
              source={source}
              index={index}
              onChange={(next) => {
                const sources = [...form.sources];
                sources[index] = next;
                patch({ sources });
              }}
              onRemove={() => patch({ sources: form.sources.filter((_, i) => i !== index) })}
            />
          ))}
        </section>
      </div>

      <aside className="xl:sticky xl:top-24 h-fit rounded-lg border border-border p-6">
        <p className="text-sm font-medium">Completitud</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {score.requiredDone} de {score.requiredTotal} campos ancla
        </p>
        <Progress className="mt-3" value={(score.requiredDone / score.requiredTotal) * 100} />
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm">
              <Check
                weight="fill"
                className={cn("mt-0.5 size-4", item.done ? "text-success" : "text-border")}
                aria-hidden
              />
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
                {item.required ? "" : <span className="text-muted-foreground"> · opcional</span>}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </form>
  );
}
