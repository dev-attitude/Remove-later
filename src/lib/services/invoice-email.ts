import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { formatNad } from "@/lib/business-manage";
import {
  buildInvoiceHtml,
  buildInvoiceText,
  computeBalanceDue,
  deriveInvoiceStatus,
  nextReminderDate,
  type InvoiceLineItem,
} from "@/lib/invoice";
import { sendEmailToClient } from "@/lib/services/client-messaging";

async function logInvoiceNotification(
  invoiceId: string,
  engagementId: string | null,
  channel: string,
  recipient: string,
  message: string,
  stepKey: string,
  success: boolean,
  error?: string
) {
  try {
    await prisma.bizNotificationLog.create({
      data: {
        invoiceId,
        engagementId,
        channel,
        recipient,
        message,
        stepKey,
        success,
        error,
      },
    });
  } catch (e) {
    console.error("[invoice-email] log failed", e);
  }
}

export async function sendInvoiceEmail(
  invoiceId: string,
  options?: { isReminder?: boolean }
): Promise<{ ok: boolean; error?: string; fallbackSent?: boolean }> {
  const invoice = await prisma.bizInvoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });

  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (!invoice.client.email?.trim()) {
    return { ok: false, error: "Client has no email address — add one on their profile first." };
  }

  const items = JSON.parse(invoice.itemsJson) as InvoiceLineItem[];
  const totals = {
    subtotalExVat: invoice.subtotalExVat,
    vatRate: invoice.vatRate,
    vatAmount: invoice.vatAmount,
    totalInclVat: invoice.totalInclVat,
  };
  const isReminder = options?.isReminder ?? false;
  const date = new Date();

  const subject = isReminder
    ? `${BRAND.companyName} — Balance due reminder: ${invoice.invoiceNumber} (${formatNad(invoice.balanceDue)})`
    : `${BRAND.companyName} — Invoice ${invoice.invoiceNumber} (${formatNad(invoice.balanceDue > 0 ? invoice.balanceDue : invoice.totalInclVat)} due)`;

  const html = buildInvoiceHtml({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    clientCompany: invoice.client.company,
    title: invoice.title,
    items,
    totals,
    amountPaid: invoice.amountPaid,
    balanceDue: invoice.balanceDue,
    notes: invoice.notes,
    dueDate: invoice.dueDate,
    date,
    isReminder,
  });

  const text = buildInvoiceText({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    title: invoice.title,
    items,
    totals,
    amountPaid: invoice.amountPaid,
    balanceDue: invoice.balanceDue,
    notes: invoice.notes,
    dueDate: invoice.dueDate,
    date,
    isReminder,
  });

  const res = await sendEmailToClient(invoice.client.email, subject, html, text);

  const now = new Date();
  const status = deriveInvoiceStatus({
    balanceDue: invoice.balanceDue,
    amountPaid: invoice.amountPaid,
    dueDate: invoice.dueDate,
    status: isReminder ? invoice.status : "sent",
  });

  await prisma.bizInvoice.update({
    where: { id: invoiceId },
    data: {
      status: invoice.balanceDue <= 0 ? "paid" : status === "draft" ? "sent" : status,
      sentAt: invoice.sentAt ?? (res.ok ? now : invoice.sentAt),
      emailSent: res.ok && !isReminder ? true : invoice.emailSent,
      emailError: res.error ?? null,
      ...(isReminder && res.ok
        ? {
            lastReminderAt: now,
            nextReminderAt: nextReminderDate(now, invoice.reminderIntervalDays),
          }
        : !isReminder && res.ok && invoice.balanceDue > 0 && invoice.reminderEnabled
          ? {
              nextReminderAt:
                invoice.nextReminderAt ??
                nextReminderDate(invoice.dueDate ?? now, invoice.reminderIntervalDays),
            }
          : {}),
    },
  });

  await logInvoiceNotification(
    invoiceId,
    invoice.engagementId,
    isReminder ? "balance_reminder" : "invoice_email",
    invoice.client.email,
    text,
    isReminder ? "balance_reminder" : "invoice_sent",
    res.ok,
    res.error
  );

  return res;
}

export async function sendBalanceReminderEmail(
  invoiceId: string
): Promise<{ ok: boolean; error?: string; fallbackSent?: boolean }> {
  const invoice = await prisma.bizInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (invoice.balanceDue <= 0) return { ok: false, error: "Invoice is fully paid" };
  if (!invoice.reminderEnabled) return { ok: false, error: "Reminders disabled for this invoice" };

  return sendInvoiceEmail(invoiceId, { isReminder: true });
}

export async function recordInvoicePayment(
  invoiceId: string,
  amount: number,
  paymentMethod?: string
): Promise<{ ok: boolean; invoice?: unknown; error?: string }> {
  const invoice = await prisma.bizInvoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (amount <= 0) return { ok: false, error: "Invalid payment amount" };

  const amountPaid = Math.round((invoice.amountPaid + amount) * 100) / 100;
  const balanceDue = computeBalanceDue(invoice.totalInclVat, amountPaid);
  const status = deriveInvoiceStatus({
    balanceDue,
    amountPaid,
    dueDate: invoice.dueDate,
    status: invoice.status,
  });

  await prisma.bizIncome.create({
    data: {
      clientId: invoice.clientId,
      engagementId: invoice.engagementId,
      amount,
      currency: invoice.currency,
      date: new Date(),
      category: balanceDue <= 0 ? "service_payment" : "deposit",
      description: `Payment on ${invoice.invoiceNumber}`,
      paymentMethod: paymentMethod?.trim() || "EFT / Bank transfer",
    },
  });

  if (invoice.engagementId) {
    const engagement = await prisma.bizEngagement.findUnique({
      where: { id: invoice.engagementId },
    });
    if (engagement) {
      const newPaid = (engagement.paidAmount ?? 0) + amount;
      await prisma.bizEngagement.update({
        where: { id: invoice.engagementId },
        data: {
          paidAmount: newPaid,
          balancePaid: balanceDue <= 0,
          depositPaid: newPaid > 0 ? true : engagement.depositPaid,
        },
      });
    }
  }

  const updated = await prisma.bizInvoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid,
      balanceDue,
      status,
      reminderEnabled: balanceDue > 0 ? invoice.reminderEnabled : false,
      nextReminderAt: balanceDue > 0 ? invoice.nextReminderAt : null,
    },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
    },
  });

  return { ok: true, invoice: updated };
}
