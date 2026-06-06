import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  engagementId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().max(8).optional(),
  date: z.string(),
  category: z.string().max(80).optional(),
  vendor: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(req: Request) {
  try {
    await requireBusinessAdmin();
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get("engagementId");

    const expenses = await prisma.bizExpense.findMany({
      where: engagementId ? { engagementId } : {},
      orderBy: { date: "desc" },
      include: {
        engagement: {
          select: { id: true, title: true, client: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({ expenses });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireBusinessAdmin();
    const body = createSchema.parse(await req.json());

    const expense = await prisma.bizExpense.create({
      data: {
        engagementId: body.engagementId || null,
        amount: body.amount,
        currency: body.currency ?? "NAD",
        date: new Date(body.date),
        category: body.category ?? "other",
        vendor: body.vendor?.trim() || null,
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
