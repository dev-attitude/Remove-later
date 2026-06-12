import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";
import { sendQuotationEmail } from "@/lib/services/quotation-email";
import type { QuotationLineItem } from "@/lib/quotation";
import {
  buildQuotationHtml,
  buildQuotationText,
} from "@/lib/quotation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const quotation = await prisma.bizQuotation.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    return NextResponse.json({ quotation });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { action?: string };

    if (body.action === "send") {
      const result = await sendQuotationEmail(id);
      const quotation = await prisma.bizQuotation.findUnique({
        where: { id },
        include: { client: { select: { id: true, name: true, email: true, company: true } } },
      });
      return NextResponse.json({ quotation, email: result });
    }

    if (body.action === "preview") {
      const quotation = await prisma.bizQuotation.findUnique({
        where: { id },
        include: { client: true },
      });
      if (!quotation) {
        return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      }
      const items = JSON.parse(quotation.itemsJson) as QuotationLineItem[];
      const totals = {
        subtotalExVat: quotation.subtotalExVat,
        vatRate: quotation.vatRate,
        vatAmount: quotation.vatAmount,
        totalInclVat: quotation.totalInclVat,
      };
      const html = buildQuotationHtml({
        quoteNumber: quotation.quoteNumber,
        clientName: quotation.client.name,
        clientEmail: quotation.client.email ?? "",
        clientCompany: quotation.client.company,
        title: quotation.title,
        items,
        totals,
        notes: quotation.notes,
        validUntil: quotation.validUntil,
        date: new Date(),
      });
      const text = buildQuotationText({
        quoteNumber: quotation.quoteNumber,
        clientName: quotation.client.name,
        title: quotation.title,
        items,
        totals,
        notes: quotation.notes,
        validUntil: quotation.validUntil,
        date: new Date(),
      });
      return NextResponse.json({ html, text });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
