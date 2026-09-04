import { NextResponse } from "next/server";
import { deleteAgency, getAgency, saveAgency } from "@/lib/pass/repo";
import type { AgencyInput } from "@/lib/pass/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await getAgency(id);
  if (!agency) return NextResponse.json({ error: "No encontramos esa agencia." }, { status: 404 });
  return NextResponse.json({ agency });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as AgencyInput;
    const agency = await saveAgency({ ...body, id });
    return NextResponse.json({ agency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos guardar la ficha.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteAgency(id);
  return NextResponse.json({ ok: true });
}
