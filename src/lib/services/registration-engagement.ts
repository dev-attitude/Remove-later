import { getRegistrationWorkflow } from "@/lib/registration-workflows";
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
