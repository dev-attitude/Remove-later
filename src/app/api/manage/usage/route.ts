import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await requireBusinessAdmin();
    const since30 = new Date(Date.now() - DAYS_30);

    const [total, last30, byAction, byPortal, topUsers, recent] = await Promise.all([
      prisma.usageLog.count(),
      prisma.usageLog.count({ where: { createdAt: { gte: since30 } } }),
      prisma.usageLog.groupBy({
        by: ["action"],
        _count: true,
        orderBy: { _count: { action: "desc" } },
      }),
      prisma.usageLog.groupBy({ by: ["portal"], _count: true }),
      prisma.usageLog.groupBy({
        by: ["userId"],
        where: { userId: { not: null }, createdAt: { gte: since30 } },
        _count: true,
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),
      prisma.usageLog.findMany({
        take: 25,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          portal: true,
          mode: true,
          createdAt: true,
          user: { select: { email: true, name: true } },
        },
      }),
    ]);

    const topUserIds = topUsers
      .map((t) => t.userId)
      .filter((id): id is string => Boolean(id));
    const topUserDetails = topUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, email: true, name: true, portal: true },
        })
      : [];
    const userById = new Map(topUserDetails.map((u) => [u.id, u]));

    return NextResponse.json({
      total,
      last30,
      byAction: byAction.map((a) => ({ action: a.action, count: a._count })),
      byPortal: byPortal.map((p) => ({ portal: p.portal ?? "unknown", count: p._count })),
      topUsers: topUsers.map((t) => ({
        count: t._count,
        user: t.userId ? (userById.get(t.userId) ?? null) : null,
      })),
      recent,
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
