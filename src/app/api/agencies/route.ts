import { NextRequest, NextResponse } from "next/server";
import { agenciesBackend } from "@/lib/pass/config";
import { findByRfc, listCatalog, saveAgency } from "@/lib/pass/repo";
import type { AgencyInput } from "@/lib/pass/types";

export async function GET(request: NextRequest) {
  try {
    const rfc = request.nextUrl.searchParams.get("rfc");
    if (rfc) {
      const agencies = await findByRfc(rfc);
      return NextResponse.json({
        agencies: agencies.map((a) => ({ id: a.id, name: a.name, rfc: a.rfc })),
      });
    }
    const catalog = await listCatalog();
    return NextResponse.json({ ...catalog, phase: agenciesBackend() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos leer las agencias.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgencyInput;
    const agency = await saveAgency(body);
    return NextResponse.json({ agency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos guardar la ficha.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
