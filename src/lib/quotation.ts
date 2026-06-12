import { BRAND } from "@/lib/brand";
import { formatNad } from "@/lib/business-manage";
import { COMPANY } from "@/lib/site-content";

export const VAT_RATE = 0.15;

export type QuotationLineItem = {
  description: string;
  quantity: number;
  unitPriceExVat: number;
};

export type QuotationTotals = {
  subtotalExVat: number;
  vatRate: number;
  vatAmount: number;
  totalInclVat: number;
};

export function calculateQuotationTotals(
  items: QuotationLineItem[],
  vatRate = VAT_RATE
): QuotationTotals {
  const subtotalExVat = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceExVat,
    0
  );
  const roundedSubtotal = Math.round(subtotalExVat * 100) / 100;
  const vatAmount = Math.round(roundedSubtotal * vatRate * 100) / 100;
  const totalInclVat = Math.round((roundedSubtotal + vatAmount) * 100) / 100;
  return {
    subtotalExVat: roundedSubtotal,
    vatRate,
    vatAmount,
    totalInclVat,
  };
}

export function generateQuoteNumber(): string {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QUO-${ymd}-${seq}`;
}

function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.gmconsultations.com"
  );
}

export function quotationLogoUrl(): string {
  return `${siteBaseUrl()}/brand/skyrapay-logo.png`;
}

function lineTotal(item: QuotationLineItem): number {
  return Math.round(item.quantity * item.unitPriceExVat * 100) / 100;
}

export function buildQuotationHtml(input: {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  title: string;
  items: QuotationLineItem[];
  totals: QuotationTotals;
  notes?: string | null;
  validUntil?: Date | null;
  date: Date;
}) {
  const vatPct = Math.round(input.totals.vatRate * 100);
  const logoUrl = quotationLogoUrl();

  const itemRows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#1f2937">${item.description}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#1f2937">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#1f2937">${formatNad(item.unitPriceExVat)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a">${formatNad(lineTotal(item))}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;color:#1f2937;background:#fff">
      <div style="padding:24px 24px 16px;border-bottom:3px solid #2563eb">
        <img src="${logoUrl}" alt="${BRAND.companyLegal}" width="180" style="display:block;max-width:180px;height:auto;margin-bottom:12px" />
        <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">${BRAND.companyLegal}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8">VAT registered · Namibia</p>
      </div>

      <div style="padding:24px">
        <h1 style="margin:0 0 4px;font-size:24px;color:#0f172a">Quotation</h1>
        <p style="margin:0 0 20px;color:#64748b;font-size:14px">${input.quoteNumber}</p>

        <table style="width:100%;margin-bottom:20px;font-size:14px">
          <tr>
            <td style="padding:4px 0;color:#64748b;width:120px">Date</td>
            <td style="padding:4px 0;color:#0f172a">${input.date.toLocaleDateString("en-NA", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
          ${input.validUntil ? `<tr><td style="padding:4px 0;color:#64748b">Valid until</td><td style="padding:4px 0;color:#0f172a">${input.validUntil.toLocaleDateString("en-NA", { day: "numeric", month: "long", year: "numeric" })}</td></tr>` : ""}
          <tr>
            <td style="padding:4px 0;color:#64748b">Prepared for</td>
            <td style="padding:4px 0;color:#0f172a"><strong>${input.clientName}</strong>${input.clientCompany ? `<br><span style="color:#64748b">${input.clientCompany}</span>` : ""}<br><span style="color:#64748b;font-size:13px">${input.clientEmail}</span></td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b">Subject</td>
            <td style="padding:4px 0;color:#0f172a">${input.title}</td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:20px;font-size:14px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">Description</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;width:60px">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;width:100px">Unit (ex VAT)</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;width:100px">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <table style="width:100%;max-width:320px;margin-left:auto;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#64748b">Subtotal (ex VAT)</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;color:#0f172a">${formatNad(input.totals.subtotalExVat)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b">VAT (${vatPct}%)</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;color:#0f172a">${formatNad(input.totals.vatAmount)}</td>
          </tr>
          <tr style="border-top:2px solid #0f172a">
            <td style="padding:12px 0;font-size:16px;font-weight:700;color:#0f172a">Total (incl. VAT)</td>
            <td style="padding:12px 0;text-align:right;font-size:18px;font-weight:700;color:#2563eb">${formatNad(input.totals.totalInclVat)}</td>
          </tr>
        </table>

        ${input.notes ? `<div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Notes</p><p style="margin:0;font-size:14px;color:#1f2937;white-space:pre-wrap">${input.notes}</p></div>` : ""}

        <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
          All amounts in Namibian Dollars (NAD). Prices exclude VAT unless stated; VAT at ${vatPct}% is added to the subtotal above.
          To accept this quotation or ask questions, reply to this email or call us.
        </p>
      </div>

      <div style="padding:20px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.6">
        <strong style="color:#0f172a">${COMPANY.shortName}</strong><br>
        ${COMPANY.poBox}<br>
        ${COMPANY.location}<br>
        ${COMPANY.phones.join(" · ")} · ${COMPANY.email}
      </div>
    </div>
  `;
}

export function buildQuotationText(input: {
  quoteNumber: string;
  clientName: string;
  title: string;
  items: QuotationLineItem[];
  totals: QuotationTotals;
  notes?: string | null;
  validUntil?: Date | null;
  date: Date;
}): string {
  const vatPct = Math.round(input.totals.vatRate * 100);
  const lines = [
    `Quotation — ${BRAND.companyLegal}`,
    `Quote: ${input.quoteNumber}`,
    `Date: ${input.date.toLocaleDateString("en-NA")}`,
    input.validUntil
      ? `Valid until: ${input.validUntil.toLocaleDateString("en-NA")}`
      : "",
    `Client: ${input.clientName}`,
    `Subject: ${input.title}`,
    "",
    "Items (ex VAT):",
    ...input.items.map(
      (i) =>
        `- ${i.description} × ${i.quantity} @ ${formatNad(i.unitPriceExVat)} = ${formatNad(lineTotal(i))}`
    ),
    "",
    `Subtotal (ex VAT): ${formatNad(input.totals.subtotalExVat)}`,
    `VAT (${vatPct}%): ${formatNad(input.totals.vatAmount)}`,
    `TOTAL (incl. VAT): ${formatNad(input.totals.totalInclVat)}`,
    input.notes ? `\nNotes:\n${input.notes}` : "",
    "",
    COMPANY.phones.join(" · "),
    COMPANY.email,
  ];
  return lines.filter(Boolean).join("\n");
}
