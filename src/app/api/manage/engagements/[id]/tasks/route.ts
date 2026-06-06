import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { computeProgressFromTasks } from "@/lib/business-manage";
import { notifyStepCompleted } from "@/lib/services/registration-client-notify";
import { recordRegistrationPayment } from "@/lib/services/registration-payments";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id: engagementId } = await params;
    const body = z.object({ title: z.string().min(1).max(300) }).parse(await req.json());

    const maxOrder = await prisma.bizTask.aggregate({
      where: { engagementId },
      _max: { sortOrder: true },
    });

    const task = await prisma.bizTask.create({
      data: {
        engagementId,
        title: body.title.trim(),
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    await syncEngagementProgress(engagementId);
    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id: engagementId } = await params;
    const body = z
      .object({
        taskId: z.string().min(1),
        title: z.string().min(1).max(300).optional(),
        done: z.boolean().optional(),
      })
      .parse(await req.json());

    const existing = await prisma.bizTask.findFirst({
      where: { id: body.taskId, engagementId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const markingComplete = body.done === true && !existing.done;

    const task = await prisma.bizTask.update({
      where: { id: body.taskId },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.done !== undefined
          ? {
              done: body.done,
              completedAt: body.done ? new Date() : null,
            }
          : {}),
      },
    });

    await syncEngagementProgress(engagementId);

    let notification: { email: boolean; sms: boolean; errors: string[] } | null = null;
    let payment: Awaited<ReturnType<typeof recordRegistrationPayment>> | null = null;
    let nextTask: { id: string; title: string; stepKey: string | null } | null = null;

    if (markingComplete && existing.stepKey) {
      notification = await notifyStepCompleted(engagementId, existing.stepKey);

      const updatedTasks = await prisma.bizTask.findMany({
        where: { engagementId },
        orderBy: { sortOrder: "asc" },
      });
      const next = updatedTasks.find((t) => !t.done);
      if (next) {
        nextTask = { id: next.id, title: next.title, stepKey: next.stepKey };
      }

      const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.done);
      if (allDone) {
        payment = await recordRegistrationPayment(engagementId, "balance");
      }
    }

    return NextResponse.json({ task, notification, payment, nextTask });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

async function syncEngagementProgress(engagementId: string) {
  const tasks = await prisma.bizTask.findMany({ where: { engagementId } });
  const progress = computeProgressFromTasks(tasks);
  if (progress !== null) {
    await prisma.bizEngagement.update({
      where: { id: engagementId },
      data: {
        progressPercent: progress,
        ...(progress === 100
          ? { status: "completed" }
          : progress > 0
            ? { status: "in_progress" }
            : {}),
      },
    });
  }
}
