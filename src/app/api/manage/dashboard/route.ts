import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET() {
  try {
    await requireBusinessAdmin();
    const start = monthStart();

    const [
      clientCounts,
      engagementCounts,
      incomeMonth,
      expenseMonth,
      incomeAll,
      expenseAll,
      recentEngagements,
    ] = await Promise.all([
      prisma.bizClient.groupBy({ by: ["status"], _count: true }),
      prisma.bizEngagement.groupBy({ by: ["status"], _count: true }),
      prisma.bizIncome.aggregate({
        where: { date: { gte: start } },
        _sum: { amount: true },
      }),
      prisma.bizExpense.aggregate({
        where: { date: { gte: start } },
        _sum: { amount: true },
      }),
      prisma.bizIncome.aggregate({ _sum: { amount: true } }),
      prisma.bizExpense.aggregate({ _sum: { amount: true } }),
      prisma.bizEngagement.findMany({
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: {
          client: { select: { id: true, name: true, company: true } },
          tasks: { select: { done: true } },
        },
      }),
    ]);

    const incomeMtd = incomeMonth._sum.amount ?? 0;
    const expenseMtd = expenseMonth._sum.amount ?? 0;

    return NextResponse.json({
      clients: {
        total: clientCounts.reduce((n, c) => n + c._count, 0),
        byStatus: Object.fromEntries(clientCounts.map((c) => [c.status, c._count])),
      },
      engagements: {
        total: engagementCounts.reduce((n, e) => n + e._count, 0),
        inProgress:
          engagementCounts.find((e) => e.status === "in_progress")?._count ?? 0,
        byStatus: Object.fromEntries(engagementCounts.map((e) => [e.status, e._count])),
      },
      finances: {
        incomeMtd,
        expenseMtd,
        netMtd: incomeMtd - expenseMtd,
        incomeAllTime: incomeAll._sum.amount ?? 0,
        expenseAllTime: expenseAll._sum.amount ?? 0,
      },
      recentEngagements: recentEngagements.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        progressPercent: e.progressPercent,
        serviceSlug: e.serviceSlug,
        client: e.client,
        updatedAt: e.updatedAt,
        taskDone: e.tasks.filter((t) => t.done).length,
        taskTotal: e.tasks.length,
      })),
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
