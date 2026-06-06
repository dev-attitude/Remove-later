import { getRegistrationWorkflow } from "@/lib/registration-workflows";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export function buildRegistrationTaskCreates(
  packageId: string
): Prisma.BizTaskCreateWithoutEngagementInput[] {
  const workflow = getRegistrationWorkflow(packageId);
  if (!workflow) return [];

  return workflow.steps.map((step, i) => ({
    title: step.title,
    stepKey: step.stepKey,
    durationNote: step.durationNote ?? null,
    sortOrder: i,
    done: false,
  }));
}

/** Create or repair BIPA workflow tasks when missing (e.g. Cash Loan NAMFISA steps). */
export async function ensureRegistrationTasks(
  engagementId: string
): Promise<{ created: number; repaired: boolean }> {
  const engagement = await prisma.bizEngagement.findUnique({
    where: { id: engagementId },
    include: { tasks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!engagement?.packageId) return { created: 0, repaired: false };

  const workflow = getRegistrationWorkflow(engagement.packageId);
  if (!workflow) return { created: 0, repaired: false };

  const existingByKey = new Map(
    engagement.tasks.filter((t) => t.stepKey).map((t) => [t.stepKey!, t])
  );

  if (engagement.tasks.length === 0) {
    const creates = buildRegistrationTaskCreates(engagement.packageId);
    await prisma.bizTask.createMany({
      data: creates.map((t) => ({ ...t, engagementId })),
    });
    return { created: creates.length, repaired: true };
  }

  const toCreate: Prisma.BizTaskCreateManyInput[] = [];
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    if (!existingByKey.has(step.stepKey)) {
      toCreate.push({
        engagementId,
        title: step.title,
        stepKey: step.stepKey,
        durationNote: step.durationNote ?? null,
        sortOrder: i,
        done: false,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.bizTask.createMany({ data: toCreate });
  }

  for (const task of engagement.tasks.filter((t) => !t.stepKey)) {
    const match = workflow.steps.find(
      (s) => s.title.toLowerCase() === task.title.toLowerCase()
    );
    if (match) {
      await prisma.bizTask.update({
        where: { id: task.id },
        data: {
          stepKey: match.stepKey,
          durationNote: match.durationNote ?? task.durationNote,
          sortOrder: workflow.steps.findIndex((s) => s.stepKey === match.stepKey),
        },
      });
    }
  }

  return { created: toCreate.length, repaired: toCreate.length > 0 };
}
