import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import {
  getEngagementStepStatus,
  getRegistrationWorkflow,
  isRegistrationPackage,
} from "@/lib/registration-workflows";
import {
  isClientEmailConfigured,
  isClientSmsConfigured,
  sendEmailToClient,
  sendSmsToClient,
} from "@/lib/services/client-messaging";

export const STALE_REGISTRATION_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type StaleRegistration = {
  engagementId: string;
  title: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  packageId: string | null;
  status: string;
  progressPercent: number;
  currentStepTitle: string | null;
  daysSinceUpdate: number;
  lastProgressAt: string;
  lastReminderAt: string | null;
  canSendReminder: boolean;
};

export type StaleReminderResult = {
  engagementId: string;
  clientName: string;
  email: boolean;
  sms: boolean;
  adminNotified: boolean;
  errors: string[];
};

export type ProcessStaleRemindersResult = {
  scanned: number;
  stale: number;
  sent: number;
  skipped: number;
  results: StaleReminderResult[];
  adminDigestSent: boolean;
  adminDigestError?: string;
};

function daysBetween(from: Date, to = new Date()): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function getLastProgressAt(
  engagement: { startDate: Date | null; createdAt: Date },
  tasks: { done: boolean; completedAt: Date | null }[]
): Date {
  const completedTimes = tasks
    .filter((t) => t.done && t.completedAt)
    .map((t) => t.completedAt!.getTime());
  if (completedTimes.length > 0) {
    return new Date(Math.max(...completedTimes));
  }
  return engagement.startDate ?? engagement.createdAt;
}

function adminNotifyEmail(): string {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.BUSINESS_ADMIN_EMAILS?.split(",")[0]?.trim() ||
    COMPANY.email
  );
}

async function logReminder(
  engagementId: string,
  channel: string,
  recipient: string,
  message: string,
  success: boolean,
  error?: string
) {
  try {
    await prisma.bizNotificationLog.create({
      data: {
        engagementId,
        channel,
        recipient,
        message,
        stepKey: "stale_reminder",
        success,
        error,
      },
    });
  } catch (e) {
    console.error("[registration-stale-reminder] log failed", e);
  }
}

async function getLastReminderAt(engagementId: string): Promise<Date | null> {
  const last = await prisma.bizNotificationLog.findFirst({
    where: { engagementId, channel: "reminder", stepKey: "stale_reminder" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return last?.createdAt ?? null;
}

export async function listStaleRegistrationEngagements(): Promise<StaleRegistration[]> {
  const engagements = await prisma.bizEngagement.findMany({
    where: {
      status: { in: ["inquiry", "quoted", "in_progress"] },
      packageId: { not: null },
      progressPercent: { lt: 100 },
    },
    include: {
      client: true,
      tasks: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const stale: StaleRegistration[] = [];

  for (const engagement of engagements) {
    if (!isRegistrationPackage(engagement.packageId)) continue;

    const lastProgressAt = getLastProgressAt(engagement, engagement.tasks);
    const daysSinceUpdate = daysBetween(lastProgressAt);
    if (daysSinceUpdate < STALE_REGISTRATION_DAYS) continue;

    const lastReminderAt = await getLastReminderAt(engagement.id);
    const daysSinceReminder = lastReminderAt ? daysBetween(lastReminderAt) : STALE_REGISTRATION_DAYS;

    const stepStatus = getEngagementStepStatus(engagement.packageId, engagement.tasks);

    stale.push({
      engagementId: engagement.id,
      title: engagement.title,
      clientName: engagement.client.name,
      clientEmail: engagement.client.email,
      clientPhone: engagement.client.phone,
      packageId: engagement.packageId,
      status: engagement.status,
      progressPercent: engagement.progressPercent,
      currentStepTitle: stepStatus?.current?.title ?? null,
      daysSinceUpdate,
      lastProgressAt: lastProgressAt.toISOString(),
      lastReminderAt: lastReminderAt?.toISOString() ?? null,
      canSendReminder: daysSinceReminder >= STALE_REGISTRATION_DAYS,
    });
  }

  return stale;
}

function buildClientSms(input: StaleRegistration): string {
  const first = input.clientName.split(" ")[0];
  const step = input.currentStepTitle ?? "your registration";
  const msg = `${BRAND.companyName}: Hi ${first}, your ${input.title} is still in progress (${step}). Some BIPA/NamRA steps take several working days — we will update you when the next step completes. Progress: ${input.progressPercent}%. ${COMPANY.phones[0]}`;
  return msg.length > 320 ? `${msg.slice(0, 317)}...` : msg;
}

function buildClientEmail(input: StaleRegistration) {
  const workflow = getRegistrationWorkflow(input.packageId);
  const stepTitle = input.currentStepTitle ?? "Initial setup";
  const durationNote =
    workflow && input.currentStepTitle
      ? workflow.steps.find((s) => s.title === input.currentStepTitle)?.durationNote
      : undefined;

  const subject = `${BRAND.companyName} — ${input.title} still in progress`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1f2937">
      <h2 style="color:#0f172a;margin:0 0 12px">Registration progress reminder</h2>
      <p>Dear ${input.clientName},</p>
      <p>This is a friendly update on your <strong>${input.title}</strong>.</p>
      <p>We are still working on your file. <strong>Current step:</strong> ${stepTitle}${
        durationNote ? ` <em>(${durationNote})</em>` : ""
      }.</p>
      <p>Government registrations (BIPA, NamRA, Social Security, NAMFISA where applicable) often take several working days at each stage. No action is required from you unless we contact you for documents or signatures.</p>
      <p style="margin-top:16px"><strong>Overall progress:</strong> ${input.progressPercent}%</p>
      <p style="font-size:13px;color:#64748b;margin-top:24px">
        ${COMPANY.name}<br>
        ${COMPANY.phones.join(" · ")}<br>
        ${COMPANY.email}
      </p>
    </div>
  `;

  const text = [
    `Dear ${input.clientName},`,
    "",
    `Your ${input.title} is still in progress.`,
    `Current step: ${stepTitle}${durationNote ? ` (${durationNote})` : ""}.`,
    "Some registration steps take several working days — we will notify you when the next step is completed.",
    `Progress: ${input.progressPercent}%.`,
    "",
    COMPANY.name,
    COMPANY.phones.join(" · "),
  ].join("\n");

  return { subject, html, text };
}

function buildAdminDigestHtml(items: StaleRegistration[], results: StaleReminderResult[]): string {
  const rows = items
    .map((item) => {
      const result = results.find((r) => r.engagementId === item.engagementId);
      const status = result
        ? result.email || result.sms
          ? "Client notified"
          : `Failed: ${result.errors.join("; ") || "unknown"}`
        : "Skipped (recent reminder)";
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.clientName}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.title}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.currentStepTitle ?? "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.daysSinceUpdate} days</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${status}</td>
      </tr>`;
    })
    .join("");

  return `
    <div style="font-family:system-ui,sans-serif;max-width:640px;color:#1f2937">
      <h2 style="color:#0f172a">Registration files needing attention</h2>
      <p>The following business registrations have had no step update in ${STALE_REGISTRATION_DAYS}+ days. Please review in Business Manager and mark the next step when progress is made.</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px">
        <thead>
          <tr style="background:#f8fafc;text-align:left">
            <th style="padding:8px">Client</th>
            <th style="padding:8px">Service</th>
            <th style="padding:8px">Current step</th>
            <th style="padding:8px">Stale</th>
            <th style="padding:8px">Reminder</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px;font-size:13px;color:#64748b">
        <a href="https://www.gmconsultations.com/manage/services">Open Services & progress</a>
      </p>
    </div>
  `;
}

export async function sendRegistrationStaleReminder(
  engagementId: string,
  options?: { force?: boolean }
): Promise<StaleReminderResult> {
  const staleList = await listStaleRegistrationEngagements();
  const item = staleList.find((s) => s.engagementId === engagementId);
  if (!item) {
    return {
      engagementId,
      clientName: "Unknown",
      email: false,
      sms: false,
      adminNotified: false,
      errors: ["Registration is not stale or not eligible for reminders"],
    };
  }
  if (!item.canSendReminder && !options?.force) {
    return {
      engagementId,
      clientName: item.clientName,
      email: false,
      sms: false,
      adminNotified: false,
      errors: ["Reminder already sent within the last 3 days"],
    };
  }

  const errors: string[] = [];
  let email = false;
  let sms = false;
  const { subject, html, text } = buildClientEmail(item);
  const smsBody = buildClientSms(item);

  if (item.clientEmail && isClientEmailConfigured()) {
    const res = await sendEmailToClient(item.clientEmail, subject, html, text);
    email = res.ok;
    await logReminder(item.engagementId, "reminder", item.clientEmail, text, res.ok, res.error);
    if (!res.ok && res.error) errors.push(`Email: ${res.error}`);
  } else if (item.clientEmail) {
    errors.push("Email not configured on server");
  }

  if (item.clientPhone && isClientSmsConfigured()) {
    const res = await sendSmsToClient(item.clientPhone, smsBody);
    sms = res.ok;
    await logReminder(item.engagementId, "reminder", item.clientPhone, smsBody, res.ok, res.error);
    if (!res.ok && res.error) errors.push(`SMS: ${res.error}`);
  }

  if (!item.clientEmail && !item.clientPhone) {
    errors.push("Client has no email or phone on file");
  }

  return {
    engagementId: item.engagementId,
    clientName: item.clientName,
    email,
    sms,
    adminNotified: false,
    errors,
  };
}

export async function processAllRegistrationStaleReminders(): Promise<ProcessStaleRemindersResult> {
  const allStale = await listStaleRegistrationEngagements();
  const toSend = allStale.filter((s) => s.canSendReminder);

  const results: StaleReminderResult[] = [];
  for (const item of toSend) {
    results.push(await sendRegistrationStaleReminder(item.engagementId));
  }

  let adminDigestSent = false;
  let adminDigestError: string | undefined;

  if (allStale.length > 0 && isClientEmailConfigured()) {
    const adminTo = adminNotifyEmail();
    const subject = `${BRAND.companyName} — ${allStale.length} registration(s) with no update in ${STALE_REGISTRATION_DAYS}+ days`;
    const html = buildAdminDigestHtml(allStale, results);
    const text = allStale
      .map(
        (s) =>
          `${s.clientName} — ${s.title} — ${s.currentStepTitle ?? "no step"} — ${s.daysSinceUpdate} days stale`
      )
      .join("\n");

    const res = await sendEmailToClient(adminTo, subject, html, text);
    adminDigestSent = res.ok;
    if (!res.ok) adminDigestError = res.error;

    for (const item of allStale) {
      await logReminder(
        item.engagementId,
        "admin_digest",
        adminTo,
        `Stale ${item.daysSinceUpdate} days — included in admin digest`,
        res.ok,
        res.error
      );
    }
  }

  return {
    scanned: allStale.length,
    stale: allStale.length,
    sent: results.filter((r) => r.email || r.sms).length,
    skipped: allStale.length - toSend.length,
    results,
    adminDigestSent,
    adminDigestError,
  };
}
