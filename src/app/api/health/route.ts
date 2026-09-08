import { NextResponse } from "next/server";
import { getPassDiagnostics } from "@/lib/pass/diagnostics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const diagnostics = await getPassDiagnostics();
  return NextResponse.json(diagnostics);
}
