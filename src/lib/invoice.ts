import { BRAND } from "@/lib/brand";
import { formatNad } from "@/lib/business-manage";
import { COMPANY } from "@/lib/site-content";
import {
  calculateQuotationTotals,
  quotationLogoUrl,
  VAT_RATE,
  type QuotationLineItem,
  type QuotationTotals,
} from "@/lib/quotation";

export { VAT_RATE };
export type InvoiceLineItem = QuotationLineItem;
export type InvoiceTotals = QuotationTotals;
export const calculateInvoiceTotals = calculateQuotationTotals;

export function generateInvoiceNumber(): string {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ymd}-${seq}`;
}

export function computeBalanceDue(totalInclVat: number, amountPaid: number): number {
  return Math.max(0, Math.round((totalInclVat - amountPaid) * 100) / 100);
}

export function deriveInvoiceStatus(input: {
  balanceDue: number;
  amountPaid: number;
  dueDate: Date | null;
  status: string;
}): string {
  if (input.status === "cancelled") return "cancelled";
  if (input.balanceDue <= 0) return "paid";
  if (input.amountPaid > 0) {
    if (input.dueDate && input.dueDate < new Date()) return "overdue";
    return "partial";
  }
  if (input.dueDate && input.dueDate < new Date()) return "overdue";
  if (input.status === "sent" || input.status === "partial" || input.status === "overdue") {
    return input.dueDate && input.dueDate < new Date() ? "overdue" : input.status;
  }
  return input.status;
}

export function nextReminderDate(from: Date, intervalDays: number): Date {
  return new Date(from.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}

function lineTotal(item: InvoiceLineItem): number {
  return Math.round(item.quantity * item.unitPriceExVat * 100) / 100;
}

function paymentBlock(input: {
  totalInclVat: number;
  amountPaid: number;
  balanceDue: number;
  dueDate?: Date | null;
  isReminder?: boolean;
}) {
  const dueLine = input.dueDate
    ? `<tr><td style="padding:4px 0;color:#64748b">Payment due</td><td style="padding:4px 0;color:#0f172a;font-weight:600">${input.dueDate.toLocaleDateString("en-NA", { day: "numeric", month: "long", year: "numeric" })}</td></tr>`
    : "";

  const balanceColor = input.balanceDue > 0 ? "#dc2626" : "#059669";

  return `
    <table style="width:100%;max-width:360px;margin:24px 0 0 auto;font-size:14px;border-top:2px solid #e2e8f0;padding-top:12px">
      <tr>
        <td style="padding:6px 0;color:#64748b">Total (incl. VAT)</td>
        <td style="padding:6px 0;text-align:right;font-weight:600">${formatNad(input.totalInclVat)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">Amount paid</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;color:#059669">${formatNad(input.amountPaid)}</td>
      </tr>
      ${dueLine}
      <tr style="border-top:2px solid #0f172a">
        <td style="padding:12px 0;font-size:16px;font-weight:700;color:#0f172a">${input.isReminder ? "Balance due now" : "Balance due"}</td>
        <td style="padding:12px 0;text-align:right;font-size:18px;font-weight:700;color:${balanceColor}">${formatNad(input.balanceDue)}</td>
      </tr>
    </table>
  `;
}

export function buildInvoiceHtml(input: {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  title: string;
  items: InvoiceLineItem[];
  totals: InvoiceTotals;
  amountPaid: number;
  balanceDue: number;
  notes?: string | null;
  dueDate?: Date | null;
  date: Date;
  isReminder?: boolean;
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

  const reminderBanner = input.isReminder
    ? `<div style="margin-bottom:20px;padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px"><p style="margin:0;font-size:14px;font-weight:600;color:#991b1b">Payment reminder — please settle the outstanding balance below.</p></div>`
    : "";

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;color:#1f2937;background:#fff">
      <div style="padding:24px 24px 16px;border-bottom:3px solid #2563eb">
        <img src="${logoUrl}" alt="${BRAND.companyLegal}" width="180" style="display:block;max-width:180px;height:auto;margin-bottom:12px" />
        <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">${BRAND.companyLegal}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8">VAT registered · Namibia</p>
      </div>

      <div style="padding:24px">
        ${reminderBanner}
        <h1 style="margin:0 0 4px;font-size:24px;color:#0f172a">Tax Invoice</h1>
        <p style="margin:0 0 20px;color:#64748b;font-size:14px">${input.invoiceNumber}</p>

        <table style="width:100%;margin-bottom:20px;font-size:14px">
          <tr>
            <td style="padding:4px 0;color:#64748b;width:120px">Date</td>
            <td style="padding:4px 0;color:#0f172a">${input.date.toLocaleDateString("en-NA", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b">Bill to</td>
            <td style="padding:4px 0;color:#0f172a"><strong>${input.clientName}</strong>${input.clientCompany ? `<br><span style="color:#64748b">${input.clientCompany}</span>` : ""}<br><span style="color:#64748b;font-size:13px">${input.clientEmail}</span></td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b">Service</td>
            <td style="padding:4px 0;color:#0f172a">${input.title}</td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:8px;font-size:14px">
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

        ${paymentBlock({
          totalInclVat: input.totals.totalInclVat,
          amountPaid: input.amountPaid,
          balanceDue: input.balanceDue,
          dueDate: input.dueDate,
          isReminder: input.isReminder,
        })}

        ${input.notes ? `<div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Notes</p><p style="margin:0;font-size:14px;color:#1f2937;white-space:pre-wrap">${input.notes}</p></div>` : ""}

        <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
          All amounts in Namibian Dollars (NAD). Please use invoice number <strong>${input.invoiceNumber}</strong> as payment reference.
          Bank EFT details available on request — reply to this email or call ${COMPANY.phones[0]}.
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

export function buildInvoiceText(input: {
  invoiceNumber: string;
  clientName: string;
  title: string;
  items: InvoiceLineItem[];
  totals: InvoiceTotals;
  amountPaid: number;
  balanceDue: number;
  notes?: string | null;
  dueDate?: Date | null;
  date: Date;
  isReminder?: boolean;
}): string {
  const vatPct = Math.round(input.totals.vatRate * 100);
  const lines = [
    input.isReminder ? "PAYMENT REMINDER" : `Tax Invoice — ${BRAND.companyLegal}`,
    `Invoice: ${input.invoiceNumber}`,
    `Date: ${input.date.toLocaleDateString("en-NA")}`,
    input.dueDate ? `Payment due: ${input.dueDate.toLocaleDateString("en-NA")}` : "",
    `Client: ${input.clientName}`,
    `Service: ${input.title}`,
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
    `Amount paid: ${formatNad(input.amountPaid)}`,
    `BALANCE DUE: ${formatNad(input.balanceDue)}`,
    input.notes ? `\nNotes:\n${input.notes}` : "",
    "",
    COMPANY.phones.join(" · "),
    COMPANY.email,
  ];
  return lines.filter(Boolean).join("\n");
}
