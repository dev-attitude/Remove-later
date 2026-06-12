import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";
import {
  buildInvoiceHtml,
  buildInvoiceText,
  type InvoiceLineItem,
} from "@/lib/invoice";
import {
  recordInvoicePayment,
  sendBalanceReminderEmail,
  sendInvoiceEmail,
} from "@/lib/services/invoice-email";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const invoice = await prisma.bizInvoice.findUnique({
      where: { id },
      include: { client: true, engagement: { select: { id: true, title: true } } },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      amount?: number;
      paymentMethod?: string;
    };

    if (body.action === "send") {
      const result = await sendInvoiceEmail(id);
      const invoice = await prisma.bizInvoice.findUnique({
        where: { id },
        include: { client: { select: { id: true, name: true, email: true, company: true } } },
      });
      return NextResponse.json({ invoice, email: result });
    }

    if (body.action === "remind") {
      const result = await sendBalanceReminderEmail(id);
      const invoice = await prisma.bizInvoice.findUnique({
        where: { id },
        include: { client: { select: { id: true, name: true, email: true, company: true } } },
      });
      return NextResponse.json({ invoice, email: result });
    }

    if (body.action === "record_payment") {
      const parsed = z
        .object({
          amount: z.number().positive(),
          paymentMethod: z.string().max(100).optional(),
        })
        .parse(body);
      const result = await recordInvoicePayment(id, parsed.amount, parsed.paymentMethod);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ invoice: result.invoice });
    }

    if (body.action === "preview") {
      const invoice = await prisma.bizInvoice.findUnique({
        where: { id },
        include: { client: true },
      });
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      const items = JSON.parse(invoice.itemsJson) as InvoiceLineItem[];
      const totals = {
        subtotalExVat: invoice.subtotalExVat,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        totalInclVat: invoice.totalInclVat,
      };
      const html = buildInvoiceHtml({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email ?? "",
        clientCompany: invoice.client.company,
        title: invoice.title,
        items,
        totals,
        amountPaid: invoice.amountPaid,
        balanceDue: invoice.balanceDue,
        notes: invoice.notes,
        dueDate: invoice.dueDate,
        date: new Date(),
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
        date: new Date(),
      });
      return NextResponse.json({ html, text });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = z
      .object({
        reminderEnabled: z.boolean().optional(),
        reminderIntervalDays: z.number().int().min(1).max(30).optional(),
        dueDate: z.string().nullable().optional(),
        notes: z.string().max(4000).nullable().optional(),
      })
      .parse(await req.json());

    const invoice = await prisma.bizInvoice.update({
      where: { id },
      data: {
        ...(body.reminderEnabled !== undefined ? { reminderEnabled: body.reminderEnabled } : {}),
        ...(body.reminderIntervalDays !== undefined
          ? { reminderIntervalDays: body.reminderIntervalDays }
          : {}),
        ...(body.dueDate !== undefined
          ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    });

    return NextResponse.json({ invoice });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}
