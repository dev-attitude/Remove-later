import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

function isHostingEngagement(e: {
  packageId: string | null;
  serviceSlug: string;
  client: { category: string };
}) {
  if (e.client.category === "hosting-web") return true;
  if (e.packageId?.startsWith("hosting-")) return true;
  return false;
}

export async function GET() {
  try {
    await requireBusinessAdmin();

    const [orders, clients, engagementsRaw] = await Promise.all([
      prisma.serviceInquiry.findMany({
        where: { kind: "hosting_order" },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.bizClient.findMany({
        where: { category: "hosting-web" },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { engagements: true, income: true } },
          engagements: {
            take: 1,
            orderBy: { updatedAt: "desc" },
            select: { id: true, title: true, status: true, progressPercent: true },
          },
        },
      }),
      prisma.bizEngagement.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          client: { select: { id: true, name: true, company: true, category: true } },
        },
      }),
    ]);

    const engagements = engagementsRaw.filter(isHostingEngagement);

    const newOrders = orders.filter((o) => o.status === "new").length;
    const inProgressOrders = orders.filter((o) => o.status === "in_progress").length;
    const activeClients = clients.filter((c) => c.status === "active").length;
    const activeWork = engagements.filter((e) =>
      ["inquiry", "quoted", "in_progress", "on_hold"].includes(e.status)
    ).length;

    const monthlyRecurring = orders.reduce((sum, o) => {
      if (!o.itemsJson) return sum;
      try {
        const items = JSON.parse(o.itemsJson) as { price: number; period?: string }[];
        return (
          sum +
          items
            .filter((i) => i.period === "month")
            .reduce((s, i) => s + (i.price ?? 0), 0)
        );
      } catch {
        return sum;
      }
    }, 0);

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        newOrders,
        inProgressOrders,
        hostingClients: clients.length,
        activeClients,
        activeWork,
        estimatedMrr: monthlyRecurring,
      },
      orders,
      clients,
      engagements: engagements.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        progressPercent: e.progressPercent,
        packageId: e.packageId,
        serviceSlug: e.serviceSlug,
        quotedAmount: e.quotedAmount,
        updatedAt: e.updatedAt,
        client: e.client,
      })),
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
