import { prisma } from "@/lib/db";
import { COMPANY } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";
import { formatNad } from "@/lib/business-manage";
import { getPackageOptions, isDepositPaymentPlan, type PaymentPlan } from "@/lib/business-manage";
import {
  quotationLogoUrl,
  type QuotationTotals,
} from "@/lib/quotation";
import { totalsFromQuotedExVat } from "@/lib/invoice";
import { sendEmailToClient } from "@/lib/services/client-messaging";

export type { PaymentPlan } from "@/lib/business-manage";
export { PAYMENT_PLANS } from "@/lib/business-manage";

export function resolvePackagePrice(packageId: string | null, quotedAmount?: number | null): number {
  if (quotedAmount != null && quotedAmount > 0) return quotedAmount;
  if (!packageId) return 0;
  const pkg = getPackageOptions().find((p) => p.id === packageId);
  return pkg?.price ?? 0;
}

/** quotedAmount on engagements is stored ex VAT — same as quotations and shop prices */
export { totalsFromQuotedExVat } from "@/lib/invoice";

export function paymentAmounts(subtotalExVat: number, plan: PaymentPlan) {
  const totals = totalsFromQuotedExVat(subtotalExVat);
  const totalInclVat = totals.totalInclVat;

  if (plan === "full_100") {
    return { totals, totalInclVat, deposit: totalInclVat, balance: 0, full: totalInclVat };
  }

  const depositRate = plan === "deposit_50" ? 0.5 : 0.6;
  const deposit = Math.round(totalInclVat * depositRate * 100) / 100;
  const balance = Math.round((totalInclVat - deposit) * 100) / 100;
  return { totals, totalInclVat, deposit, balance, full: totalInclVat };
}

function depositLabel(plan: PaymentPlan): string {
  if (plan === "deposit_50") return "Deposit (50%)";
  if (plan === "deposit_60") return "Deposit (60%)";
  return "Full payment (100%)";
}

function balanceLabel(plan: PaymentPlan): string {
  if (plan === "deposit_50") return "Final balance (50%)";
  return "Final balance (40%)";
}

function depositInvoiceSuffix(plan: PaymentPlan): string {
  if (plan === "deposit_50") return "DEP50";
  if (plan === "deposit_60") return "DEP60";
  return "FULL";
}

function balanceInvoiceSuffix(plan: PaymentPlan): string {
  if (plan === "deposit_50") return "BAL50";
  return "BAL40";
}

function invoiceNumber(engagementId: string, suffix: string) {
  const short = engagementId.slice(-6).toUpperCase();
  return `INV-${short}-${suffix}`;
}

function buildInvoiceHtml(input: {
  invoiceNo: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  packageLabel: string;
  amount: number;
  paymentLabel: string;
  totals: QuotationTotals;
  paidToDate: number;
  balanceRemaining: number;
  date: Date;
}) {
  const vatPct = Math.round(input.totals.vatRate * 100);
  const logoUrl = quotationLogoUrl();

  const rows = [
    ["Invoice number", input.invoiceNo],
    ["Date", input.date.toLocaleDateString("en-NA")],
    ["Client", input.clientName],
    ["Email", input.clientEmail],
    ["Service", input.serviceTitle],
    ["Package", input.packageLabel],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;width:40%">${label}</td><td style="padding:8px 12px;color:#1f2937;border-bottom:1px solid #e2e8f0">${value}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;color:#1f2937;background:#fff">
      <div style="padding:20px 20px 12px;border-bottom:3px solid #2563eb">
        <img src="${logoUrl}" alt="${BRAND.companyLegal}" width="160" style="display:block;max-width:160px;height:auto;margin-bottom:8px" />
        <p style="margin:0;font-size:12px;color:#64748b">${BRAND.companyLegal} · VAT registered · Namibia</p>
      </div>
      <div style="padding:20px">
        <h1 style="color:#0f172a;margin:0 0 16px;font-size:22px">Tax Invoice</h1>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:20px;font-size:14px">
          ${tableRows}
        </table>

        <table style="width:100%;max-width:320px;margin-left:auto;font-size:14px;margin-bottom:20px">
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
            <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:700;color:#2563eb">${formatNad(input.totals.totalInclVat)}</td>
          </tr>
        </table>

        <table style="width:100%;max-width:360px;margin-left:auto;font-size:14px;border-top:2px solid #e2e8f0;padding-top:12px">
          <tr>
            <td style="padding:6px 0;color:#64748b">${input.paymentLabel}</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a">${formatNad(input.amount)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b">Paid to date (incl. VAT)</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;color:#059669">${formatNad(input.paidToDate)}</td>
          </tr>
          <tr style="border-top:2px solid #0f172a">
            <td style="padding:12px 0;font-size:16px;font-weight:700;color:#0f172a">Balance due (incl. VAT)</td>
            <td style="padding:12px 0;text-align:right;font-size:18px;font-weight:700;color:${input.balanceRemaining > 0 ? "#dc2626" : "#059669"}">${formatNad(input.balanceRemaining)}</td>
          </tr>
        </table>

        <p style="font-size:13px;color:#64748b;margin-top:24px;line-height:1.6">
          All amounts in Namibian Dollars (NAD). Please use invoice number <strong>${input.invoiceNo}</strong> as payment reference.
        </p>
        <p style="font-size:13px;color:#64748b;margin-top:16px;line-height:1.6">
          ${COMPANY.name}<br>
          ${COMPANY.poBox}<br>
          ${COMPANY.phones.join(" · ")} · ${COMPANY.email}
        </p>
      </div>
    </div>
  `;
}

function buildInvoiceText(input: {
  invoiceNo: string;
  clientName: string;
  serviceTitle: string;
  amount: number;
  paymentLabel: string;
  totals: QuotationTotals;
  paidToDate: number;
  balanceRemaining: number;
}) {
  const vatPct = Math.round(input.totals.vatRate * 100);
  return [
    `Tax Invoice — ${BRAND.companyLegal}`,
    `Invoice: ${input.invoiceNo}`,
    `Client: ${input.clientName}`,
    `Service: ${input.serviceTitle}`,
    "",
    `Subtotal (ex VAT): ${formatNad(input.totals.subtotalExVat)}`,
    `VAT (${vatPct}%): ${formatNad(input.totals.vatAmount)}`,
    `TOTAL (incl. VAT): ${formatNad(input.totals.totalInclVat)}`,
    "",
    `${input.paymentLabel}: ${formatNad(input.amount)}`,
    `Paid to date (incl. VAT): ${formatNad(input.paidToDate)}`,
    `Balance due (incl. VAT): ${formatNad(input.balanceRemaining)}`,
    "",
    COMPANY.phones.join(" · "),
    COMPANY.email,
  ].join("\n");
}

export async function sendClientInvoice(input: {
  engagementId: string;
  clientEmail: string;
  clientName: string;
  serviceTitle: string;
  packageLabel: string;
  amount: number;
  currency: string;
  paymentLabel: string;
  totals: QuotationTotals;
  paidToDate: number;
  balanceRemaining: number;
  invoiceSuffix: string;
}): Promise<{ ok: boolean; invoiceNo: string; error?: string }> {
  const invoiceNo = invoiceNumber(input.engagementId, input.invoiceSuffix);
  const date = new Date();
  const subject = `${BRAND.companyName} — Invoice ${invoiceNo} (${formatNad(input.amount)} incl. VAT)`;
  const html = buildInvoiceHtml({ ...input, invoiceNo, date });
  const text = buildInvoiceText({
    invoiceNo,
    clientName: input.clientName,
    serviceTitle: input.serviceTitle,
    amount: input.amount,
    paymentLabel: input.paymentLabel,
    totals: input.totals,
    paidToDate: input.paidToDate,
    balanceRemaining: input.balanceRemaining,
  });

  const res = await sendEmailToClient(input.clientEmail, subject, html, text);

  try {
    await prisma.bizNotificationLog.create({
      data: {
        engagementId: input.engagementId,
        channel: "invoice_email",
        recipient: input.clientEmail,
        message: text,
        stepKey: input.invoiceSuffix,
        success: res.ok,
        error: res.error,
      },
    });
  } catch {
    /* non-blocking */
  }

  return { ok: res.ok, invoiceNo, error: res.error };
}

export async function recordRegistrationPayment(
  engagementId: string,
  phase: "initial" | "balance"
): Promise<{ recorded: boolean; amount: number; invoiceSent: boolean; error?: string }> {
  const engagement = await prisma.bizEngagement.findUnique({
    where: { id: engagementId },
    include: { client: true, income: true },
  });
  if (!engagement?.paymentPlan) {
    return { recorded: false, amount: 0, invoiceSent: false, error: "No payment plan" };
  }

  const plan = engagement.paymentPlan as PaymentPlan;
  const subtotalExVat = engagement.quotedAmount ?? 0;
  if (subtotalExVat <= 0) {
    return { recorded: false, amount: 0, invoiceSent: false, error: "No quoted amount" };
  }

  const amounts = paymentAmounts(subtotalExVat, plan);
  let amount = 0;
  let paymentLabel = "";
  let invoiceSuffix = "";

  if (phase === "initial") {
    if (engagement.depositPaid) {
      return { recorded: false, amount: 0, invoiceSent: false, error: "Initial payment already recorded" };
    }
    amount = plan === "full_100" ? amounts.full : amounts.deposit;
    paymentLabel = depositLabel(plan);
    invoiceSuffix = depositInvoiceSuffix(plan);
  } else {
    if (!isDepositPaymentPlan(plan)) {
      return { recorded: false, amount: 0, invoiceSent: false, error: "No balance for full payment plan" };
    }
    if (engagement.balancePaid) {
      return { recorded: false, amount: 0, invoiceSent: false, error: "Balance already recorded" };
    }
    if (!engagement.depositPaid) {
      return { recorded: false, amount: 0, invoiceSent: false, error: "Deposit not yet paid" };
    }
    amount = amounts.balance;
    paymentLabel = balanceLabel(plan);
    invoiceSuffix = balanceInvoiceSuffix(plan);
  }

  await prisma.bizIncome.create({
    data: {
      clientId: engagement.clientId,
      engagementId,
      amount,
      currency: engagement.currency,
      date: new Date(),
      category: phase === "initial" ? "deposit" : "service_payment",
      description: `${paymentLabel} (incl. VAT)`,
      paymentMethod: "Recorded automatically",
    },
  });

  const paidTotal = Math.round(((engagement.paidAmount ?? 0) + amount) * 100) / 100;
  const balanceRemaining = Math.max(0, Math.round((amounts.totalInclVat - paidTotal) * 100) / 100);

  await prisma.bizEngagement.update({
    where: { id: engagementId },
    data: {
      paidAmount: paidTotal,
      depositPaid: phase === "initial" ? true : engagement.depositPaid,
      balancePaid: phase === "balance" ? true : plan === "full_100" ? true : engagement.balancePaid,
    },
  });

  const pkg = getPackageOptions().find((p) => p.id === engagement.packageId);
  let invoiceSent = false;
  let invoiceError: string | undefined;

  if (engagement.client.email) {
    const inv = await sendClientInvoice({
      engagementId,
      clientEmail: engagement.client.email,
      clientName: engagement.client.name,
      serviceTitle: engagement.title,
      packageLabel: pkg?.name ?? engagement.title,
      amount,
      currency: engagement.currency,
      paymentLabel,
      totals: amounts.totals,
      paidToDate: paidTotal,
      balanceRemaining,
      invoiceSuffix,
    });
    invoiceSent = inv.ok;
    invoiceError = inv.error;
  }

  return {
    recorded: true,
    amount,
    invoiceSent,
    error: invoiceError ?? (!engagement.client.email ? "Client has no email for invoice" : undefined),
  };
}
