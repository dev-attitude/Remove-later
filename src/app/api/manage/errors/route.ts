import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const DAYS_7 = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await requireBusinessAdmin();
    const since7 = new Date(Date.now() - DAYS_7);

    const [errors, last7, bySource] = await Promise.all([
      prisma.errorLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.errorLog.count({ where: { createdAt: { gte: since7 } } }),
      prisma.errorLog.groupBy({
        by: ["source"],
        where: { createdAt: { gte: since7 } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
      }),
    ]);

    const userIds = [...new Set(errors.map((e) => e.userId).filter(Boolean))] as string[];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true },
        })
      : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      last7,
      bySource: bySource.map((s) => ({ source: s.source, count: s._count })),
      errors: errors.map((e) => ({
        id: e.id,
        source: e.source,
        message: e.message,
        createdAt: e.createdAt,
        user: e.userId ? (userById.get(e.userId) ?? null) : null,
      })),
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
