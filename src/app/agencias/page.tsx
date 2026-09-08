import Link from "next/link";
import { MagnifyingGlass, Plus, Buildings } from "@phosphor-icons/react/dist/ssr";
import { StatusPill } from "@/components/composed/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tagVariant } from "@/lib/pass/invoice-flags";
import { listCatalog } from "@/lib/pass/repo";
import { maskRfc } from "@/lib/utils";

function agencyTags(agency: { sources: { tags: string[] }[] }) {
  return [...new Set(agency.sources.flatMap((s) => s.tags ?? []))];
}

export default async function AgenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { agencies, groups } = await listCatalog();
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "—";
  const query = q.trim().toLowerCase();
  const filtered = query
    ? agencies.filter((a) =>
        [a.name, a.legalName, a.rfc, a.city, a.state, a.brand, groupName(a.groupId), ...agencyTags(a)]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : agencies;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {agencies.length} fichas · la base contra la que se cruzan las facturas
          </p>
        </div>
        <Button asChild>
          <Link href="/agencias/nueva">
            <Plus weight="fill" />
            Nueva agencia
          </Link>
        </Button>
      </div>

      <form action="/agencias" method="get" className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Nombre, RFC, ciudad, grupo o etiqueta"
            className="pl-9"
            aria-label="Buscar agencia"
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border p-8">
          <Buildings weight="fill" className="size-8 text-primary" aria-hidden />
          {query ? (
            <>
              <h2 className="text-lg font-semibold">Sin resultados para «{q}»</h2>
              <p className="text-sm text-muted-foreground">Revisa el RFC o quita el filtro.</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Aún no hay agencias en la base</h2>
              <p className="text-sm text-muted-foreground">
                Crea la primera ficha — con ella se podrán cruzar facturas.
              </p>
              <Button asChild>
                <Link href="/agencias/nueva">Nueva agencia</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agencia</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Facturas origen</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agency) => {
                const tags = agencyTags(agency);
                return (
                <TableRow key={agency.id} className="relative">
                  <TableCell>
                    <Link href={`/agencias/${agency.id}`} className="font-medium hover:text-primary after:absolute after:inset-0">
                      {agency.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{agency.legalName || "Sin razón social"}</p>
                  </TableCell>
                  <TableCell>{groupName(agency.groupId)}</TableCell>
                  <TableCell className="font-mono text-xs" title={agency.rfc}>
                    {maskRfc(agency.rfc)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {[agency.city, agency.state].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <span>{agency.sources.length}</span>
                      {tags.length > 0 ? (
                        <div className="relative z-10 flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <Badge key={tag} variant={tagVariant(tag)}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={agency.status} />
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
