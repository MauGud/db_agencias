import { NextRequest, NextResponse } from "next/server";
import { invoicesConfigured } from "@/lib/pass/config";
import { searchInvoices } from "@/lib/pass/invoices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchInvoices(q);
  return NextResponse.json({ configured: invoicesConfigured(), results });
}
