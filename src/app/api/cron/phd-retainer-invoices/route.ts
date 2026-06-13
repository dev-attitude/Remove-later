import { NextResponse } from "next/server";
import { processPhdRetainerInvoices } from "@/lib/services/phd-retainer-invoices";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Monthly job (1st of month): invoice active PhD retainer clients */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processPhdRetainerInvoices();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/phd-retainer-invoices]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 }
    );
  }
}
