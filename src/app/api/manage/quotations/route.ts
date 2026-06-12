import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";
import {
  calculateQuotationTotals,
  generateQuoteNumber,
  VAT_RATE,
  type QuotationLineItem,
} from "@/lib/quotation";
import { sendQuotationEmail } from "@/lib/services/quotation-email";

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
  notes: z.string().max(4000).optional(),
  validUntil: z.string().optional(),
  sendEmail: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireBusinessAdmin();
    const quotations = await prisma.bizQuotation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    });
    return NextResponse.json({ quotations });
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

    const items = body.items as QuotationLineItem[];
    const totals = calculateQuotationTotals(items, VAT_RATE);
    const validUntil = body.validUntil ? new Date(body.validUntil) : null;

    let quoteNumber = generateQuoteNumber();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.bizQuotation.findUnique({ where: { quoteNumber } });
      if (!exists) break;
      quoteNumber = generateQuoteNumber();
      attempts++;
    }

    const quotation = await prisma.bizQuotation.create({
      data: {
        quoteNumber,
        clientId: body.clientId,
        engagementId: body.engagementId || null,
        title: body.title.trim(),
        itemsJson: JSON.stringify(items),
        subtotalExVat: totals.subtotalExVat,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        totalInclVat: totals.totalInclVat,
        notes: body.notes?.trim() || null,
        validUntil,
        status: "draft",
        createdBy: session.user.id,
      },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    });

    let emailResult: { ok: boolean; error?: string; fallbackSent?: boolean } | null = null;
    if (body.sendEmail !== false) {
      emailResult = await sendQuotationEmail(quotation.id);
    }

    const updated = await prisma.bizQuotation.findUnique({
      where: { id: quotation.id },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    });

    return NextResponse.json(
      { quotation: updated, email: emailResult },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid quotation data" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}
