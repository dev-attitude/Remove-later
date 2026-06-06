import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { computeProgressFromTasks } from "@/lib/business-manage";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const taskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  done: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

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

    const task = await prisma.bizTask.update({
      where: { id: body.taskId, engagementId },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.done !== undefined ? { done: body.done } : {}),
      },
    });

    await syncEngagementProgress(engagementId);
    return NextResponse.json({ task });
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
        ...(progress === 100 ? { status: "completed" } : {}),
      },
    });
  }
}
