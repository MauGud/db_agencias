import Link from "next/link";
import { Buildings, Car, Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCatalog } from "@/lib/pass/repo";

export default async function GruposPage() {
  const { groups, agencies } = await listCatalog();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Grupos automotrices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Un grupo agrupa agencias que se cruzan juntas contra facturas.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border p-8">
          <Car weight="fill" className="size-8 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">Aún no hay grupos</h2>
          <p className="text-sm text-muted-foreground">
            El grupo se crea al capturar la primera agencia.
          </p>
          <Button asChild>
            <Link href="/agencias/nueva">Nueva agencia</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const owned = agencies.filter((a) => a.groupId === group.id);
            const former = agencies.filter(
              (a) => a.groupId !== group.id && a.groupHistory.some((h) => h.groupId === group.id),
            );
            return (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {group.brands.length ? group.brands.join(", ") : "Sin marcas aún"}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Buildings weight="fill" className="size-4" />
                    {owned.length} {owned.length === 1 ? "agencia" : "agencias"}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {owned.map((a) => (
                      <li key={a.id}>
                        <Link href={`/agencias/${a.id}`} className="text-sm hover:text-primary">
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {former.length ? (
                    <div className="mt-1 rounded-md border border-border bg-muted/40 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">Historial · ya no venden con este grupo</p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {former.map((a) => {
                          const entry = a.groupHistory.find((h) => h.groupId === group.id);
                          return (
                            <li key={a.id}>
                              <Link href={`/agencias/${a.id}`} className="text-sm hover:text-primary">
                                {a.name}
                              </Link>
                              {entry?.brand ? (
                                <span className="text-xs text-muted-foreground"> · vendía {entry.brand}</span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
                    <Link href={`/agencias/nueva?grupo=${group.id}`}>
                      <Plus weight="fill" />
                      Agregar agencia
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
