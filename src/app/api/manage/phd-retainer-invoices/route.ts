import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { manageErrorResponse } from "@/lib/manage-api";
import {
  billingPeriodLabel,
  listActivePhdRetainerEngagements,
  processPhdRetainerInvoices,
} from "@/lib/services/phd-retainer-invoices";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireBusinessAdmin();
    const now = new Date();
    const engagements = await listActivePhdRetainerEngagements();
    return NextResponse.json({
      billingPeriod: billingPeriodLabel(now),
      count: engagements.length,
      engagements: engagements.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        client: e.client,
        quotedAmount: e.quotedAmount,
      })),
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST() {
  try {
    await requireBusinessAdmin();
    const result = await processPhdRetainerInvoices();
    return NextResponse.json({ result });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
