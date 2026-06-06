import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { buildRegistrationTaskCreates } from "@/lib/services/registration-engagement";
import { notifyRegistrationStarted } from "@/lib/services/registration-client-notify";
import { getRegistrationWorkflow } from "@/lib/registration-workflows";
import {
  recordRegistrationPayment,
  resolvePackagePrice,
} from "@/lib/services/registration-payments";
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
  paymentPlan: z.enum(["deposit_60", "full_100"]).optional(),
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

    const workflow = getRegistrationWorkflow(body.packageId);
    const registrationTasks = workflow ? buildRegistrationTaskCreates(body.packageId!) : [];
    const manualTasks = body.tasks?.length
      ? body.tasks.map((title, i) => ({
          title: title.trim(),
          sortOrder: i,
        }))
      : [];

    const taskCreates =
      registrationTasks.length > 0
        ? registrationTasks
        : manualTasks.length > 0
          ? manualTasks
          : undefined;

    const quotedAmount =
      body.quotedAmount ??
      (workflow && body.packageId ? resolvePackagePrice(body.packageId) : null);

    if (workflow && !body.paymentPlan) {
      return NextResponse.json(
        { error: "Select a payment plan: 60% deposit or 100% full payment." },
        { status: 400 }
      );
    }

    const engagement = await prisma.bizEngagement.create({
      data: {
        clientId: body.clientId,
        title: body.title.trim(),
        serviceSlug: body.serviceSlug,
        packageId: body.packageId || null,
        paymentPlan: workflow ? body.paymentPlan : null,
        status: workflow ? "in_progress" : (body.status ?? "inquiry"),
        progressPercent: 0,
        quotedAmount: quotedAmount && quotedAmount > 0 ? quotedAmount : null,
        paidAmount: 0,
        depositPaid: false,
        balancePaid: false,
        currency: body.currency ?? "NAD",
        startDate: body.startDate ? new Date(body.startDate) : workflow ? new Date() : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes?.trim() || null,
        tasks: taskCreates ? { create: taskCreates } : undefined,
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        tasks: { orderBy: { sortOrder: "asc" } },
      },
    });

    let payment: Awaited<ReturnType<typeof recordRegistrationPayment>> | null = null;
    if (workflow && body.paymentPlan) {
      payment = await recordRegistrationPayment(engagement.id, "initial");
      notifyRegistrationStarted(engagement.id).catch((err) =>
        console.error("[engagement] start notify failed", err)
      );
    }

    return NextResponse.json({ engagement, payment }, { status: 201 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
