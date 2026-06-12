import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { manageErrorResponse } from "@/lib/manage-api";
import {
  listInvoicesDueForReminder,
  processInvoiceBalanceReminders,
} from "@/lib/services/invoice-balance-reminders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireBusinessAdmin();
    const due = await listInvoicesDueForReminder();
    return NextResponse.json({ count: due.length, due });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST() {
  try {
    await requireBusinessAdmin();
    const result = await processInvoiceBalanceReminders();
    return NextResponse.json({ result });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
