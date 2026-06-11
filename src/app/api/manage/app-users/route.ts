import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireBusinessAdmin();

    const [users, usageByUser, lastActiveByUser] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          portal: true,
          createdAt: true,
          subscription: {
            select: {
              tierId: true,
              status: true,
              portal: true,
              currentPeriodEnd: true,
              stripeSubscriptionId: true,
            },
          },
          _count: { select: { usageLogs: true, campusMemberships: true } },
        },
      }),
      prisma.usageLog.groupBy({ by: ["userId"], _count: true }),
      prisma.usageLog.groupBy({ by: ["userId"], _max: { createdAt: true } }),
    ]);

    const usageCount = new Map(usageByUser.map((u) => [u.userId, u._count]));
    const lastActive = new Map(
      lastActiveByUser.map((u) => [u.userId, u._max.createdAt])
    );

    const rows = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      portal: u.portal,
      createdAt: u.createdAt,
      subscription: u.subscription,
      usageCount: usageCount.get(u.id) ?? 0,
      lastActive: lastActive.get(u.id) ?? null,
      campusMemberships: u._count.campusMemberships,
    }));

    const activeSubs = rows.filter((r) => r.subscription?.status === "active").length;
    const paying = rows.filter(
      (r) => r.subscription?.status === "active" && r.subscription?.stripeSubscriptionId
    ).length;

    return NextResponse.json({
      summary: {
        total: rows.length,
        activeSubscriptions: activeSubs,
        payingSubscriptions: paying,
        byPortal: rows.reduce<Record<string, number>>((acc, r) => {
          acc[r.portal] = (acc[r.portal] ?? 0) + 1;
          return acc;
        }, {}),
      },
      users: rows,
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
