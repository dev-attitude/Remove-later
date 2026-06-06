import { prisma } from "@/lib/db";
import { COMPANY } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";
import {
  getNextStepAfter,
  getRegistrationWorkflow,
  type RegistrationStep,
} from "@/lib/registration-workflows";
import {
  isClientEmailConfigured,
  isClientSmsConfigured,
  sendEmailToClient,
  sendSmsToClient,
} from "@/lib/services/client-messaging";

export type RegistrationUpdatePayload = {
  engagementId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  serviceTitle: string;
  packageId: string | null;
  completedStep: RegistrationStep;
  nextStep: RegistrationStep | null;
  progressPercent: number;
  kind: "step_completed" | "started";
};

function buildSms(payload: RegistrationUpdatePayload): string {
  const line =
    payload.kind === "started"
      ? `We have started your ${payload.serviceTitle}. Step 1: ${payload.completedStep.title}.`
      : payload.nextStep
        ? `Step done: ${payload.completedStep.title}. Now in progress: ${payload.nextStep.title}.`
        : `Step completed: ${payload.completedStep.title}. Registration complete.`;
  const msg = `${BRAND.companyName}: Hi ${payload.clientName.split(" ")[0]}, ${line} Progress: ${payload.progressPercent}%. Call ${COMPANY.phones[0]} for questions.`;
  return msg.length > 320 ? `${msg.slice(0, 317)}...` : msg;
}

function buildEmail(payload: RegistrationUpdatePayload) {
  const subject = `${BRAND.companyName} — ${payload.serviceTitle} update (${payload.progressPercent}%)`;
  const nextHtml = payload.nextStep
    ? `<p><strong>Next step:</strong> ${payload.nextStep.title}${
        payload.nextStep.durationNote
          ? ` <em>(${payload.nextStep.durationNote})</em>`
          : ""
      }</p>`
    : `<p><strong>Status:</strong> All registration steps are complete. We will contact you for document handover.</p>`;

  const completedLine =
    payload.kind === "started"
      ? `<p>We have opened your file and started work on your registration.</p>
         <p><strong>Current step:</strong> ${payload.completedStep.title}</p>`
      : `<p><strong>Completed:</strong> ${payload.completedStep.title}</p>`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1f2937">
      <h2 style="color:#0f172a;margin:0 0 12px">Registration progress update</h2>
      <p>Dear ${payload.clientName},</p>
      ${completedLine}
      ${nextHtml}
      <p style="margin-top:16px"><strong>Overall progress:</strong> ${payload.progressPercent}%</p>
      <p style="font-size:13px;color:#64748b;margin-top:24px">
        ${COMPANY.name}<br>
        ${COMPANY.phones.join(" · ")}<br>
        ${COMPANY.email}
      </p>
    </div>
  `;

  const text = [
    `Dear ${payload.clientName},`,
    "",
    payload.kind === "started"
      ? `We have started your ${payload.serviceTitle}. Step 1: ${payload.completedStep.title}.`
      : payload.nextStep
        ? `Step completed: ${payload.completedStep.title}. Now in progress: ${payload.nextStep.title}.`
        : `Step completed: ${payload.completedStep.title}. Registration complete.`,
    payload.nextStep ? `Next step: ${payload.nextStep.title}` : "All steps complete.",
    `Progress: ${payload.progressPercent}%`,
    "",
    COMPANY.name,
    COMPANY.phones.join(" · "),
  ].join("\n");

  return { subject, html, text };
}

async function logNotification(
  engagementId: string,
  channel: string,
  recipient: string,
  message: string,
  stepKey: string | null,
  success: boolean,
  error?: string
) {
  try {
    await prisma.bizNotificationLog.create({
      data: { engagementId, channel, recipient, message, stepKey, success, error },
    });
  } catch (e) {
    console.error("[registration-notify] log failed", e);
  }
}

export async function notifyClientRegistrationUpdate(
  payload: RegistrationUpdatePayload
): Promise<{ email: boolean; sms: boolean; errors: string[] }> {
  const errors: string[] = [];
  let email = false;
  let sms = false;
  const smsBody = buildSms(payload);
  const { subject, html, text } = buildEmail(payload);

  if (payload.clientEmail && isClientEmailConfigured()) {
    const res = await sendEmailToClient(payload.clientEmail, subject, html, text);
    email = res.ok;
    await logNotification(
      payload.engagementId,
      "email",
      payload.clientEmail,
      text,
      payload.completedStep.stepKey,
      res.ok,
      res.error
    );
    if (!res.ok && res.error) errors.push(`Email: ${res.error}`);
  } else if (payload.clientEmail) {
    errors.push("Email not configured on server");
  }

  if (payload.clientPhone && isClientSmsConfigured()) {
    const res = await sendSmsToClient(payload.clientPhone, smsBody);
    sms = res.ok;
    await logNotification(
      payload.engagementId,
      "sms",
      payload.clientPhone,
      smsBody,
      payload.completedStep.stepKey,
      res.ok,
      res.error
    );
    if (!res.ok && res.error) errors.push(`SMS: ${res.error}`);
  } else if (payload.clientPhone) {
    errors.push("SMS not configured on server");
  }

  if (!payload.clientEmail && !payload.clientPhone) {
    errors.push("Client has no email or phone on file");
  }

  return { email, sms, errors };
}

export async function notifyStepCompleted(
  engagementId: string,
  completedStepKey: string
): Promise<{ email: boolean; sms: boolean; errors: string[] }> {
  const engagement = await prisma.bizEngagement.findUnique({
    where: { id: engagementId },
    include: {
      client: true,
      tasks: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!engagement) return { email: false, sms: false, errors: ["Engagement not found"] };

  const workflow = getRegistrationWorkflow(engagement.packageId);
  if (!workflow) return { email: false, sms: false, errors: ["Not a registration workflow"] };

  const completedStep = workflow.steps.find((s) => s.stepKey === completedStepKey);
  if (!completedStep) return { email: false, sms: false, errors: ["Step not found"] };

  const nextStep = getNextStepAfter(workflow, completedStepKey);
  const tasks = engagement.tasks;
  const progress =
    tasks.length > 0
      ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
      : 0;

  return notifyClientRegistrationUpdate({
    engagementId,
    clientName: engagement.client.name,
    clientEmail: engagement.client.email,
    clientPhone: engagement.client.phone,
    serviceTitle: engagement.title,
    packageId: engagement.packageId,
    completedStep,
    nextStep,
    progressPercent: progress,
    kind: "step_completed",
  });
}

export async function notifyRegistrationStarted(engagementId: string): Promise<void> {
  const engagement = await prisma.bizEngagement.findUnique({
    where: { id: engagementId },
    include: { client: true, tasks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!engagement) return;
  const workflow = getRegistrationWorkflow(engagement.packageId);
  if (!workflow || workflow.steps.length === 0) return;

  const firstStep = workflow.steps[0];
  const secondStep = workflow.steps[1] ?? null;

  await notifyClientRegistrationUpdate({
    engagementId,
    clientName: engagement.client.name,
    clientEmail: engagement.client.email,
    clientPhone: engagement.client.phone,
    serviceTitle: engagement.title,
    packageId: engagement.packageId,
    completedStep: firstStep,
    nextStep: secondStep,
    progressPercent: 0,
    kind: "started",
  });
}
