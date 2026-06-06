/** BIPA / NamRA / Social Security registration steps per Skyrapay package */

export type RegistrationStep = {
  stepKey: string;
  title: string;
  durationNote?: string;
};

export type RegistrationWorkflow = {
  packageId: string;
  label: string;
  steps: RegistrationStep[];
};

const CC_STEPS: RegistrationStep[] = [
  { stepKey: "bipa_name", title: "Name reservation with BIPA" },
  { stepKey: "accounting_letter", title: "Accounting letter" },
  {
    stepKey: "bipa_cc1",
    title: "Submission of CC1 form to BIPA for registration",
    durationNote: "Approx. 5 working days",
  },
  { stepKey: "namra", title: "NamRA registration" },
  { stepKey: "social_security", title: "Social Security registration" },
];

const PTY_NGO_STEPS: RegistrationStep[] = [
  { stepKey: "bipa_name", title: "Name reservation with BIPA" },
  { stepKey: "auditor_lawyer", title: "Auditor and lawyer" },
  {
    stepKey: "bipa_submission",
    title: "Submission for registration at BIPA",
    durationNote: "Max. 5 working days",
  },
  { stepKey: "namra", title: "NamRA tax registration" },
  { stepKey: "social_security", title: "Social Security registration" },
];

const CASHLOAN_STEPS: RegistrationStep[] = [
  { stepKey: "bipa_name", title: "Name reservation with BIPA" },
  {
    stepKey: "namfisa_name",
    title: "Name reservation at NAMFISA",
    durationNote: "Approx. 14 working days",
  },
  { stepKey: "accounting_letter", title: "Accounting letter" },
  {
    stepKey: "bipa_cc1",
    title: "Submission of CC1 form to BIPA for registration",
    durationNote: "Approx. 5 working days",
  },
  { stepKey: "namra", title: "NamRA registration" },
  { stepKey: "social_security", title: "Social Security registration" },
  {
    stepKey: "namfisa_reg",
    title: "Registration at NAMFISA",
    durationNote: "Final step",
  },
];

export const REGISTRATION_WORKFLOWS: RegistrationWorkflow[] = [
  { packageId: "cc-full-registration", label: "CC — Full Registration", steps: CC_STEPS },
  { packageId: "cc-cashloan-registration", label: "CC — Cash Loan", steps: CASHLOAN_STEPS },
  { packageId: "pty-registration", label: "(Pty) Ltd Registration", steps: PTY_NGO_STEPS },
  { packageId: "ngo-registration", label: "NGO / Church Registration", steps: PTY_NGO_STEPS },
];

export function getRegistrationWorkflow(packageId: string | null | undefined): RegistrationWorkflow | null {
  if (!packageId) return null;
  return REGISTRATION_WORKFLOWS.find((w) => w.packageId === packageId) ?? null;
}

export function isRegistrationPackage(packageId: string | null | undefined): boolean {
  return Boolean(getRegistrationWorkflow(packageId));
}

export function getCurrentStepFromTasks(
  workflow: RegistrationWorkflow,
  tasks: { id: string; stepKey: string | null; title: string; done: boolean; sortOrder: number }[]
) {
  const ordered = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const completedCount = ordered.filter((t) => t.done).length;
  const firstOpen = ordered.find((t) => !t.done);
  if (!firstOpen) {
    return {
      current: null as RegistrationStep | null,
      currentTask: null,
      index: ordered.length,
      completedCount,
      total: ordered.length,
    };
  }
  const idx = ordered.findIndex((t) => t.id === firstOpen.id);
  const stepDef =
    workflow.steps.find((s) => s.stepKey === firstOpen.stepKey) ??
    ({ stepKey: firstOpen.stepKey ?? "custom", title: firstOpen.title } as RegistrationStep);
  return {
    current: stepDef,
    currentTask: firstOpen,
    index: idx,
    completedCount,
    total: ordered.length,
  };
}

export function getNextStepAfter(
  workflow: RegistrationWorkflow,
  completedStepKey: string
): RegistrationStep | null {
  const idx = workflow.steps.findIndex((s) => s.stepKey === completedStepKey);
  if (idx < 0 || idx >= workflow.steps.length - 1) return null;
  return workflow.steps[idx + 1];
}
