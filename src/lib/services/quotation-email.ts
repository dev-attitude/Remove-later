import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { formatNad } from "@/lib/business-manage";
import {
  buildQuotationHtml,
  buildQuotationText,
  type QuotationLineItem,
} from "@/lib/quotation";
import { sendEmailToClient } from "@/lib/services/client-messaging";

export async function sendQuotationEmail(quotationId: string): Promise<{
  ok: boolean;
  error?: string;
  fallbackSent?: boolean;
}> {
  const quote = await prisma.bizQuotation.findUnique({
    where: { id: quotationId },
    include: { client: true },
  });

  if (!quote) return { ok: false, error: "Quotation not found" };
  if (!quote.client.email?.trim()) {
    return { ok: false, error: "Client has no email address — add one on their profile first." };
  }

  const items = JSON.parse(quote.itemsJson) as QuotationLineItem[];
  const date = quote.sentAt ?? new Date();
  const totals = {
    subtotalExVat: quote.subtotalExVat,
    vatRate: quote.vatRate,
    vatAmount: quote.vatAmount,
    totalInclVat: quote.totalInclVat,
  };

  const subject = `${BRAND.companyName} — Quotation ${quote.quoteNumber} (${formatNad(quote.totalInclVat)} incl. VAT)`;
  const html = buildQuotationHtml({
    quoteNumber: quote.quoteNumber,
    clientName: quote.client.name,
    clientEmail: quote.client.email,
    clientCompany: quote.client.company,
    title: quote.title,
    items,
    totals,
    notes: quote.notes,
    validUntil: quote.validUntil,
    date,
  });
  const text = buildQuotationText({
    quoteNumber: quote.quoteNumber,
    clientName: quote.client.name,
    title: quote.title,
    items,
    totals,
    notes: quote.notes,
    validUntil: quote.validUntil,
    date,
  });

  const res = await sendEmailToClient(quote.client.email, subject, html, text);

  await prisma.bizQuotation.update({
    where: { id: quotationId },
    data: {
      status: res.ok || res.fallbackSent ? "sent" : quote.status,
      sentAt: res.ok || res.fallbackSent ? new Date() : quote.sentAt,
      emailSent: res.ok,
      emailError: res.error ?? null,
    },
  });

  return res;
}
