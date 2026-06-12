import { NextResponse } from "next/server";
import { processInvoiceBalanceReminders } from "@/lib/services/invoice-balance-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily job: email clients with outstanding invoice balances */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processInvoiceBalanceReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/invoice-reminders]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 }
    );
  }
}
