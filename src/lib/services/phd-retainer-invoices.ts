import { prisma } from "@/lib/db";
import { PHD_MONTHLY_PACKAGE_ID } from "@/lib/business-manage";
import { resolvePackagePrice } from "@/lib/services/registration-payments";
import {
  calculateInvoiceTotals,
  computeBalanceDue,
  deriveInvoiceStatus,
  generateInvoiceNumber,
  nextReminderDate,
  VAT_RATE,
  type InvoiceLineItem,
} from "@/lib/invoice";
import { sendInvoiceEmail } from "@/lib/services/invoice-email";

const RETAINER_DUE_DAYS = 14;
const RETAINER_REMINDER_DAYS = 3;

export type PhdRetainerInvoiceResult = {
  engagementId: string;
  clientName: string;
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  emailSent?: boolean;
  error?: string;
};

export type ProcessPhdRetainerInvoicesResult = {
  billingPeriod: string;
  scanned: number;
  created: number;
  skipped: number;
  failed: number;
  results: PhdRetainerInvoiceResult[];
};

function billingPeriodKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function billingPeriodLabel(date: Date): string {
  return date.toLocaleDateString("en-NA", { month: "long", year: "numeric" });
}

function retainerInvoiceTitle(periodLabel: string): string {
  return `PhD Research Assistance — ${periodLabel}`;
}

function retainerLineDescription(periodLabel: string): string {
  return `PhD research assistance retainer — ${periodLabel}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function uniqueInvoiceNumber(): Promise<string> {
  let invoiceNumber = generateInvoiceNumber();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.bizInvoice.findUnique({ where: { invoiceNumber } });
    if (!exists) return invoiceNumber;
    invoiceNumber = generateInvoiceNumber();
  }
  return invoiceNumber;
}

export async function hasPhdRetainerInvoiceForPeriod(
  engagementId: string,
  periodKey: string
): Promise<boolean> {
  const existing = await prisma.bizInvoice.findFirst({
    where: {
      engagementId,
      invoiceType: "retainer",
      notes: { contains: `Billing period: ${periodKey}` },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

type EngagementForRetainer = {
  id: string;
  packageId: string | null;
  quotedAmount: number | null;
  status: string;
  client: { id: string; name: string; email: string | null };
};

export async function createPhdRetainerInvoice(
  engagement: EngagementForRetainer,
  billingDate: Date = new Date()
): Promise<PhdRetainerInvoiceResult> {
  const periodKey = billingPeriodKey(billingDate);
  const periodLabel = billingPeriodLabel(billingDate);
  const base: PhdRetainerInvoiceResult = {
    engagementId: engagement.id,
    clientName: engagement.client.name,
    ok: false,
  };

  if (engagement.packageId !== PHD_MONTHLY_PACKAGE_ID) {
    return { ...base, skipped: true, reason: "Not a PhD monthly engagement" };
  }

  if (!["in_progress", "quoted"].includes(engagement.status)) {
    return { ...base, skipped: true, reason: `Status is ${engagement.status}` };
  }

  if (await hasPhdRetainerInvoiceForPeriod(engagement.id, periodKey)) {
    return { ...base, skipped: true, reason: `Invoice already exists for ${periodLabel}` };
  }

  const unitPrice = resolvePackagePrice(engagement.packageId, engagement.quotedAmount);
  if (unitPrice <= 0) {
    return { ...base, error: "Could not resolve monthly retainer amount" };
  }

  if (!engagement.client.email?.trim()) {
    return {
      ...base,
      error: "Client has no email — add one on their profile before auto-invoicing",
    };
  }

  const items: InvoiceLineItem[] = [
    {
      description: retainerLineDescription(periodLabel),
      quantity: 1,
      unitPriceExVat: unitPrice,
    },
  ];

  const totals = calculateInvoiceTotals(items, VAT_RATE);
  const amountPaid = 0;
  const balanceDue = computeBalanceDue(totals.totalInclVat, amountPaid);
  const now = new Date();
  const dueDate = addDays(now, RETAINER_DUE_DAYS);
  const invoiceNumber = await uniqueInvoiceNumber();
  const title = retainerInvoiceTitle(periodLabel);
  const notes = `Monthly PhD research assistance retainer. Billing period: ${periodKey}.`;

  const invoice = await prisma.bizInvoice.create({
    data: {
      invoiceNumber,
      clientId: engagement.client.id,
      engagementId: engagement.id,
      title,
      itemsJson: JSON.stringify(items),
      subtotalExVat: totals.subtotalExVat,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      totalInclVat: totals.totalInclVat,
      amountPaid,
      balanceDue,
      notes,
      dueDate,
      reminderEnabled: true,
      reminderIntervalDays: RETAINER_REMINDER_DAYS,
      nextReminderAt: nextReminderDate(dueDate, RETAINER_REMINDER_DAYS),
      invoiceType: "retainer",
      status: deriveInvoiceStatus({
        balanceDue,
        amountPaid,
        dueDate,
        status: "draft",
      }),
    },
  });

  const emailResult = await sendInvoiceEmail(invoice.id);

  return {
    engagementId: engagement.id,
    clientName: engagement.client.name,
    ok: true,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    emailSent: emailResult.ok,
    error: emailResult.ok ? undefined : emailResult.error,
  };
}

export async function listActivePhdRetainerEngagements() {
  return prisma.bizEngagement.findMany({
    where: {
      packageId: PHD_MONTHLY_PACKAGE_ID,
      status: { in: ["in_progress", "quoted"] },
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** Generate monthly retainer invoices for all active PhD engagements */
export async function processPhdRetainerInvoices(
  billingDate: Date = new Date()
): Promise<ProcessPhdRetainerInvoicesResult> {
  const periodKey = billingPeriodKey(billingDate);
  const engagements = await listActivePhdRetainerEngagements();
  const results: PhdRetainerInvoiceResult[] = [];

  for (const engagement of engagements) {
    try {
      const result = await createPhdRetainerInvoice(engagement, billingDate);
      results.push(result);
    } catch (e) {
      results.push({
        engagementId: engagement.id,
        clientName: engagement.client.name,
        ok: false,
        error: e instanceof Error ? e.message : "Failed to create invoice",
      });
    }
  }

  return {
    billingPeriod: periodKey,
    scanned: engagements.length,
    created: results.filter((r) => r.ok).length,
    skipped: results.filter((r) => r.skipped).length,
    failed: results.filter((r) => !r.ok && !r.skipped).length,
    results,
  };
}
