import {
  getRegistrationWorkflow,
  isRegistrationPackage,
  REGISTRATION_WORKFLOWS,
  type EngagementStepStatus,
  type EngagementTask,
  type RegistrationWorkflow,
} from "@/lib/registration-workflows";
import { getWritingWorkflow, isWritingPackage, WRITING_WORKFLOWS } from "@/lib/writing-workflows";

export type ServiceWorkflow = RegistrationWorkflow;

export const SERVICE_WORKFLOWS: ServiceWorkflow[] = [
  ...REGISTRATION_WORKFLOWS,
  ...WRITING_WORKFLOWS,
];

export function getServiceWorkflow(
  packageId: string | null | undefined
): ServiceWorkflow | null {
  if (!packageId) return null;
  return (
    getRegistrationWorkflow(packageId) ??
    getWritingWorkflow(packageId) ??
    null
  );
}

export function hasServiceWorkflow(packageId: string | null | undefined): boolean {
  return Boolean(getServiceWorkflow(packageId));
}

export { isRegistrationPackage, isWritingPackage };

export function getEngagementStepStatus(
  packageId: string | null | undefined,
  tasks: EngagementTask[]
): EngagementStepStatus | null {
  const workflow = getServiceWorkflow(packageId);
  if (!workflow || tasks.length === 0) return null;

  const ordered = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const completed = ordered.filter((t) => t.done);
  const current = ordered.find((t) => !t.done) ?? null;
  const currentIndex = current ? ordered.findIndex((t) => t.id === current.id) : ordered.length;
  const upcoming = current ? ordered.filter((t) => !t.done && t.id !== current.id) : [];

  return {
    workflow,
    completed,
    current,
    currentIndex,
    upcoming,
    total: ordered.length,
    allDone: !current,
  };
}
