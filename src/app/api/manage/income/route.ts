import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  clientId: z.string().optional(),
  engagementId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().max(8).optional(),
  date: z.string(),
  category: z.string().max(80).optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.string().max(80).optional(),
});

export async function GET(req: Request) {
  try {
    await requireBusinessAdmin();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const engagementId = searchParams.get("engagementId");

    const income = await prisma.bizIncome.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(engagementId ? { engagementId } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        engagement: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ income });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireBusinessAdmin();
    const body = createSchema.parse(await req.json());

    const record = await prisma.bizIncome.create({
      data: {
        clientId: body.clientId || null,
        engagementId: body.engagementId || null,
        amount: body.amount,
        currency: body.currency ?? "NAD",
        date: new Date(body.date),
        category: body.category ?? "service_payment",
        description: body.description?.trim() || null,
        paymentMethod: body.paymentMethod?.trim() || null,
      },
    });

    if (body.engagementId) {
      const paid = await prisma.bizIncome.aggregate({
        where: { engagementId: body.engagementId },
        _sum: { amount: true },
      });
      await prisma.bizEngagement.update({
        where: { id: body.engagementId },
        data: { paidAmount: paid._sum.amount ?? 0 },
      });
    }

    return NextResponse.json({ income: record }, { status: 201 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
