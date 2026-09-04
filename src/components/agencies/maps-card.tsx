"use client";

import { ArrowSquareOut, MapPin, Warning } from "@phosphor-icons/react";

export function AgencyMapsCard({
  loading,
  mapsUrl,
  mapsEmbedUrl,
  placeName,
  nameMismatch,
  reviewMessage,
}: {
  loading?: boolean;
  mapsUrl: string;
  mapsEmbedUrl: string;
  placeName: string;
  nameMismatch?: boolean;
  reviewMessage?: string | null;
}) {
  if (!mapsUrl && !loading && !reviewMessage) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          <MapPin weight="fill" className="size-4 text-primary" />
          Google Maps
        </p>
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Abrir ficha de la agencia
            <ArrowSquareOut className="size-3.5" />
          </a>
        ) : null}
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Buscando la agencia en el mapa…</p> : null}
      {reviewMessage ? (
        <p
          className={
            nameMismatch
              ? "rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm"
              : "text-sm text-muted-foreground"
          }
        >
          {nameMismatch ? <Warning weight="fill" className="mr-1 inline size-4 text-warning" /> : null}
          {reviewMessage}
        </p>
      ) : placeName ? (
        <p className="text-sm text-muted-foreground">En el mapa aparece como «{placeName}».</p>
      ) : null}
      {mapsEmbedUrl ? (
        <iframe
          title="Ubicación en Google Maps"
          src={mapsEmbedUrl}
          className="h-56 w-full rounded-md border border-border bg-muted"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : null}
    </div>
  );
}
