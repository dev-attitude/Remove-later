import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { ensureRegistrationTasks } from "@/lib/services/registration-engagement";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  serviceSlug: z.string().min(1).max(80).optional(),
  packageId: z.string().max(80).nullable().optional(),
  status: z
    .enum(["inquiry", "quoted", "in_progress", "on_hold", "completed", "cancelled"])
    .optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  quotedAmount: z.number().min(0).nullable().optional(),
  paidAmount: z.number().min(0).optional(),
  currency: z.string().max(8).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  notes: z.string().max(8000).nullable().optional(),
});

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;

    const engagement = await prisma.bizEngagement.findUnique({
      where: { id },
      include: {
        client: true,
        tasks: { orderBy: { sortOrder: "asc" } },
        income: { orderBy: { date: "desc" } },
        expenses: { orderBy: { date: "desc" } },
      },
    });

    if (!engagement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await ensureRegistrationTasks(id);

    const refreshed = await prisma.bizEngagement.findUnique({
      where: { id },
      include: {
        client: true,
        tasks: { orderBy: { sortOrder: "asc" } },
        income: { orderBy: { date: "desc" } },
        expenses: { orderBy: { date: "desc" } },
      },
    });

    return NextResponse.json({ engagement: refreshed ?? engagement });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const engagement = await prisma.bizEngagement.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.serviceSlug !== undefined ? { serviceSlug: body.serviceSlug } : {}),
        ...(body.packageId !== undefined ? { packageId: body.packageId } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.progressPercent !== undefined
          ? { progressPercent: body.progressPercent }
          : {}),
        ...(body.quotedAmount !== undefined ? { quotedAmount: body.quotedAmount } : {}),
        ...(body.paidAmount !== undefined ? { paidAmount: body.paidAmount } : {}),
        ...(body.currency !== undefined ? { currency: body.currency } : {}),
        ...(body.startDate !== undefined
          ? { startDate: body.startDate ? new Date(body.startDate) : null }
          : {}),
        ...(body.dueDate !== undefined
          ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
      },
      include: { tasks: true },
    });

    return NextResponse.json({ engagement });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;

    await prisma.$transaction([
      prisma.bizIncome.deleteMany({ where: { engagementId: id } }),
      prisma.bizExpense.deleteMany({ where: { engagementId: id } }),
      prisma.bizEngagement.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
