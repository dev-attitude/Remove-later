import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";
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

export const dynamic = "force-dynamic";

const lineSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unitPriceExVat: z.number().min(0),
});

const createSchema = z.object({
  clientId: z.string().min(1),
  engagementId: z.string().optional(),
  title: z.string().min(1).max(200),
  items: z.array(lineSchema).min(1),
  amountPaid: z.number().min(0).optional(),
  notes: z.string().max(4000).optional(),
  dueDate: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderIntervalDays: z.number().int().min(1).max(30).optional(),
  invoiceType: z.enum(["service", "deposit", "balance"]).optional(),
  sendEmail: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireBusinessAdmin();
    const invoices = await prisma.bizInvoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        engagement: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json({ invoices });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireBusinessAdmin();
    const body = createSchema.parse(await req.json());

    const client = await prisma.bizClient.findUnique({ where: { id: body.clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let amountPaid = body.amountPaid ?? 0;
    if (body.engagementId) {
      const engagement = await prisma.bizEngagement.findUnique({
        where: { id: body.engagementId },
      });
      if (!engagement || engagement.clientId !== body.clientId) {
        return NextResponse.json({ error: "Invalid service link" }, { status: 400 });
      }
      if (body.amountPaid === undefined) {
        amountPaid = engagement.paidAmount ?? 0;
      }
    }

    const items = body.items as InvoiceLineItem[];
    const totals = calculateInvoiceTotals(items, VAT_RATE);
    const balanceDue = computeBalanceDue(totals.totalInclVat, amountPaid);
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;
    const reminderIntervalDays = body.reminderIntervalDays ?? 3;
    const reminderEnabled = body.reminderEnabled !== false && balanceDue > 0;

    let invoiceNumber = generateInvoiceNumber();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.bizInvoice.findUnique({ where: { invoiceNumber } });
      if (!exists) break;
      invoiceNumber = generateInvoiceNumber();
      attempts++;
    }

    const now = new Date();
    const status = deriveInvoiceStatus({
      balanceDue,
      amountPaid,
      dueDate,
      status: "draft",
    });

    const invoice = await prisma.bizInvoice.create({
      data: {
        invoiceNumber,
        clientId: body.clientId,
        engagementId: body.engagementId || null,
        title: body.title.trim(),
        itemsJson: JSON.stringify(items),
        subtotalExVat: totals.subtotalExVat,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        totalInclVat: totals.totalInclVat,
        amountPaid,
        balanceDue,
        notes: body.notes?.trim() || null,
        dueDate,
        reminderEnabled,
        reminderIntervalDays,
        nextReminderAt:
          reminderEnabled && balanceDue > 0
            ? nextReminderDate(dueDate && dueDate > now ? dueDate : now, reminderIntervalDays)
            : null,
        invoiceType: body.invoiceType ?? "service",
        status: balanceDue <= 0 ? "paid" : status,
        createdBy: session.user.id,
      },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        engagement: { select: { id: true, title: true } },
      },
    });

    let emailResult: { ok: boolean; error?: string; fallbackSent?: boolean } | null = null;
    if (body.sendEmail !== false) {
      emailResult = await sendInvoiceEmail(invoice.id);
    }

    const updated = await prisma.bizInvoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        engagement: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ invoice: updated, email: emailResult }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid invoice data" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}
