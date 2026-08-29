# Captura de agencias — Nexcar

Interfaz para armar la base de **grupos automotrices y agencias** contra la que se cruzan facturas de inspección documental. Tokens y componentes del [design system de Nexcar](https://nexcar-ds.vercel.app/).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin keys de Pass, guarda en `data/store.json` (ya viene sembrado con las fichas de la hoja *DB Agencias*).

## Pass (Supabase) — dos fases

Toda la persistencia vive en `src/lib/pass/`. El UI no sabe en qué proyecto está.

1. **Fase 1** — cuenta personal (padre): copia `.env.example` a `.env.local`, llena URL + service role, corre `supabase/migrations/001_agencies.sql`.
2. **Fase 2** — base de Nexcar: cambia las mismas variables. No toques queries ni pantallas.

## Facturas (`invoice`)

El URL de cada ficha se liga a los documentos analizados (`INVOICES_TABLE`, type = `invoice`). El patrón de la hoja:

`{supabase}/storage/v1/object/public/vehicles/prod/{vehicleId}/{fileId}.pdf`
