import { NextResponse } from "next/server";
import { resolveAgencyPlace } from "@/lib/pass/places";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; address?: string };
    const result = await resolveAgencyPlace({
      name: body.name ?? "",
      address: body.address ?? "",
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos localizar la agencia.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
