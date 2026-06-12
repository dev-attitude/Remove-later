import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { manageErrorResponse } from "@/lib/manage-api";
import {
  listStaleRegistrationEngagements,
  processAllRegistrationStaleReminders,
  sendRegistrationStaleReminder,
  STALE_REGISTRATION_DAYS,
} from "@/lib/services/registration-stale-reminders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireBusinessAdmin();
    const stale = await listStaleRegistrationEngagements();
    return NextResponse.json({
      staleDays: STALE_REGISTRATION_DAYS,
      count: stale.length,
      pendingReminders: stale.filter((s) => s.canSendReminder).length,
      stale,
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireBusinessAdmin();
    const body = (await req.json().catch(() => ({}))) as {
      engagementId?: string;
      all?: boolean;
    };

    if (body.engagementId) {
      const result = await sendRegistrationStaleReminder(body.engagementId, { force: true });
      return NextResponse.json({ result });
    }

    const result = await processAllRegistrationStaleReminders();
    return NextResponse.json({ result });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
