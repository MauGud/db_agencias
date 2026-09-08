import { NextResponse } from "next/server";
import { listGroups, saveGroup } from "@/lib/pass/repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const groups = await listGroups();
    return NextResponse.json({ groups });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos leer los grupos.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name: string; brands?: string[]; notes?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El grupo necesita un nombre." }, { status: 400 });
    }
    const group = await saveGroup(body);
    return NextResponse.json({ group });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos crear el grupo.";
    const status = /Pass no está configurado|store local|solo lectura|\/var\/task/i.test(message)
      ? 503
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
