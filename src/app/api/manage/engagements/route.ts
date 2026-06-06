import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(300),
  serviceSlug: z.string().min(1).max(80),
  packageId: z.string().max(80).optional(),
  status: z
    .enum(["inquiry", "quoted", "in_progress", "on_hold", "completed", "cancelled"])
    .optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  quotedAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  currency: z.string().max(8).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(8000).optional(),
  tasks: z.array(z.string().min(1).max(300)).optional(),
});

export async function GET(req: Request) {
  try {
    await requireBusinessAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const engagements = await prisma.bizEngagement.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(clientId ? { clientId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { id: true, name: true, company: true } },
        tasks: { orderBy: { sortOrder: "asc" } },
        _count: { select: { income: true, expenses: true } },
      },
    });

    return NextResponse.json({ engagements });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireBusinessAdmin();
    const body = createSchema.parse(await req.json());

    const engagement = await prisma.bizEngagement.create({
      data: {
        clientId: body.clientId,
        title: body.title.trim(),
        serviceSlug: body.serviceSlug,
        packageId: body.packageId || null,
        status: body.status ?? "inquiry",
        progressPercent: body.progressPercent ?? 0,
        quotedAmount: body.quotedAmount ?? null,
        paidAmount: body.paidAmount ?? 0,
        currency: body.currency ?? "NAD",
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes?.trim() || null,
        tasks: body.tasks?.length
          ? {
              create: body.tasks.map((title, i) => ({
                title: title.trim(),
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
        tasks: true,
      },
    });

    return NextResponse.json({ engagement }, { status: 201 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
