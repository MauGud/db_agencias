"use client";

import * as React from "react";
import { ClockCounterClockwise, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AgencyGroupHistory, AutomotiveGroup } from "@/lib/pass/types";

function brandMatchesGroup(brand: string, group?: AutomotiveGroup) {
  if (!brand.trim() || !group || group.brands.length === 0) return true;
  const needle = brand.trim().toLowerCase();
  return group.brands.some((b) => {
    const hay = b.toLowerCase();
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

export function AgencyGroupHistoryPanel({
  groups,
  currentGroupId,
  currentBrand,
  history,
  onChange,
  onCreateGroup,
}: {
  groups: AutomotiveGroup[];
  currentGroupId: string;
  currentBrand: string;
  history: AgencyGroupHistory[];
  onChange: (next: AgencyGroupHistory[]) => void;
  onCreateGroup: (name: string, brands?: string[]) => Promise<AutomotiveGroup | null>;
}) {
  const currentGroup = groups.find((g) => g.id === currentGroupId);
  const mismatch = Boolean(currentGroupId && currentBrand && !brandMatchesGroup(currentBrand, currentGroup));
  const [dismissed, setDismissed] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [prevGroupId, setPrevGroupId] = React.useState("");
  const [prevBrand, setPrevBrand] = React.useState("");
  const [newPrevGroup, setNewPrevGroup] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    setDismissed(false);
  }, [currentGroupId, currentBrand]);

  const showPrompt = mismatch && !dismissed && !adding && history.length === 0;

  function groupName(id: string) {
    return groups.find((g) => g.id === id)?.name ?? "Grupo anterior";
  }

  async function addPrevious() {
    let groupId = prevGroupId;
    if (!groupId && newPrevGroup.trim()) {
      setCreating(true);
      const created = await onCreateGroup(newPrevGroup.trim(), prevBrand.trim() ? [prevBrand.trim()] : []);
      setCreating(false);
      if (!created) return;
      groupId = created.id;
      setNewPrevGroup("");
    }
    if (!groupId || groupId === currentGroupId) return;
    onChange([
      ...history,
      {
        id: crypto.randomUUID(),
        agencyId: "",
        groupId,
        brand: prevBrand.trim(),
        note: prevBrand.trim()
          ? `Vendía ${prevBrand.trim()} con ${groupName(groupId)}`
          : `Antes pertenecía a ${groupName(groupId)}`,
        recordedAt: new Date().toISOString(),
      },
    ]);
    setPrevGroupId("");
    setPrevBrand("");
    setAdding(false);
    setDismissed(true);
  }

  return (
    <div className="sm:col-span-2 flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium">
            <ClockCounterClockwise className="size-4 text-primary" />
            Historia de la agencia
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si cambió de marca o de grupo (ej. Jebla Motos vendía BAIC y ahora Chevrolet), el grupo anterior se
            conserva aquí. El grupo actual de la ficha no se sustituye.
          </p>
        </div>
        {!adding ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus weight="fill" />
            Grupo anterior
          </Button>
        ) : null}
      </div>

      {showPrompt ? (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-3">
          <p className="text-sm font-medium">¿Crees que la agencia cambió de grupo automotriz que vendía?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            La marca «{currentBrand}» no está en {currentGroup?.name ?? "este grupo"}. Puede ser la misma agencia con
            otra marca.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => setAdding(true)}>
              Sí, agregar grupo anterior
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              No, es el grupo actual
            </Button>
          </div>
        </div>
      ) : null}

      {history.length ? (
        <ul className="flex flex-col gap-2">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{groupName(entry.groupId)}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.brand ? `Vendía ${entry.brand}` : "Mismo predio, otro grupo automotriz"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Quitar grupo anterior"
                onClick={() => onChange(history.filter((h) => h.id !== entry.id))}
              >
                <Trash className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {adding ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Select value={prevGroupId || "none"} onValueChange={(v) => setPrevGroupId(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Grupo que vendía antes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Elige un grupo anterior</SelectItem>
                {groups
                  .filter((g) => g.id !== currentGroupId)
                  .map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="O crea el grupo anterior, ej. Jebla Motos"
                value={newPrevGroup}
                onChange={(e) => setNewPrevGroup(e.target.value)}
              />
            </div>
          </div>
          <Input
            placeholder="Marca que vendía, ej. BAIC"
            value={prevBrand}
            onChange={(e) => setPrevBrand(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => void addPrevious()} disabled={creating || (!prevGroupId && !newPrevGroup.trim())}>
              {creating ? "Creando…" : "Guardar en historial"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
