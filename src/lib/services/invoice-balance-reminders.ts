import { prisma } from "@/lib/db";
import { sendBalanceReminderEmail } from "@/lib/services/invoice-email";
import { deriveInvoiceStatus } from "@/lib/invoice";

export type DueInvoice = {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  title: string;
  balanceDue: number;
  dueDate: string | null;
  nextReminderAt: string | null;
  lastReminderAt: string | null;
  daysOverdue: number;
};

export type ProcessInvoiceRemindersResult = {
  scanned: number;
  due: number;
  sent: number;
  failed: number;
  results: Array<{ invoiceId: string; invoiceNumber: string; ok: boolean; error?: string }>;
};

export async function listInvoicesDueForReminder(): Promise<DueInvoice[]> {
  const now = new Date();
  const invoices = await prisma.bizInvoice.findMany({
    where: {
      balanceDue: { gt: 0.01 },
      reminderEnabled: true,
      status: { notIn: ["paid", "cancelled", "draft"] },
    },
    include: { client: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  });

  return invoices
    .filter((inv) => {
      if (!inv.nextReminderAt) {
        if (inv.dueDate && inv.dueDate <= now) return true;
        if (inv.sentAt) {
          const daysSinceSent = Math.floor(
            (now.getTime() - inv.sentAt.getTime()) / (24 * 60 * 60 * 1000)
          );
          return daysSinceSent >= inv.reminderIntervalDays;
        }
        return false;
      }
      return inv.nextReminderAt <= now;
    })
    .map((inv) => ({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.client.name,
      title: inv.title,
      balanceDue: inv.balanceDue,
      dueDate: inv.dueDate?.toISOString() ?? null,
      nextReminderAt: inv.nextReminderAt?.toISOString() ?? null,
      lastReminderAt: inv.lastReminderAt?.toISOString() ?? null,
      daysOverdue: inv.dueDate
        ? Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / (24 * 60 * 60 * 1000)))
        : 0,
    }));
}

export async function processInvoiceBalanceReminders(): Promise<ProcessInvoiceRemindersResult> {
  const dueList = await listInvoicesDueForReminder();
  const results: ProcessInvoiceRemindersResult["results"] = [];

  for (const item of dueList) {
    const res = await sendBalanceReminderEmail(item.invoiceId);
    results.push({
      invoiceId: item.invoiceId,
      invoiceNumber: item.invoiceNumber,
      ok: res.ok,
      error: res.error,
    });

    if (res.ok) {
      const inv = await prisma.bizInvoice.findUnique({ where: { id: item.invoiceId } });
      if (inv) {
        const status = deriveInvoiceStatus({
          balanceDue: inv.balanceDue,
          amountPaid: inv.amountPaid,
          dueDate: inv.dueDate,
          status: inv.status,
        });
        if (status === "overdue" || (inv.dueDate && inv.dueDate < new Date())) {
          await prisma.bizInvoice.update({
            where: { id: item.invoiceId },
            data: { status: "overdue" },
          });
        }
      }
    }
  }

  return {
    scanned: dueList.length,
    due: dueList.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
