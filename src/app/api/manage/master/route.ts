import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

/** Cross-service totals for the master admin overview */
export async function GET() {
  try {
    await requireBusinessAdmin();
    const since30 = new Date(Date.now() - DAYS_30);

    const [
      appUsers,
      newUsers30,
      activeSubs,
      payingSubs,
      usage30,
      platformBooks,
      campusTenants,
      campusStudents,
      newInquiries,
      errors7,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since30 } } }),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.subscription.count({
        where: { status: "active", stripeSubscriptionId: { not: null } },
      }),
      prisma.usageLog.count({ where: { createdAt: { gte: since30 } } }),
      prisma.understandingBook.count({ where: { userId: null } }),
      prisma.campusTenant.count(),
      prisma.campusStudent.count(),
      prisma.serviceInquiry.count({ where: { status: "new" } }),
      prisma.errorLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return NextResponse.json({
      research: {
        users: appUsers,
        newUsers30,
        activeSubscriptions: activeSubs,
        payingSubscriptions: payingSubs,
        usageActions30: usage30,
        platformBooks,
      },
      campus: {
        tenants: campusTenants,
        students: campusStudents,
      },
      support: {
        newInquiries,
        errors7,
      },
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
