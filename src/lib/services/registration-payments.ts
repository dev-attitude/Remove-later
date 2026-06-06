import { prisma } from "@/lib/db";
import { COMPANY } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";
import { formatNad } from "@/lib/business-manage";
import { getPackageOptions, isDepositPaymentPlan, type PaymentPlan } from "@/lib/business-manage";
import { sendEmailToClient } from "@/lib/services/client-messaging";

export type { PaymentPlan } from "@/lib/business-manage";
export { PAYMENT_PLANS } from "@/lib/business-manage";

export function resolvePackagePrice(packageId: string | null, quotedAmount?: number | null): number {
  if (quotedAmount != null && quotedAmount > 0) return quotedAmount;
  if (!packageId) return 0;
  const pkg = getPackageOptions().find((p) => p.id === packageId);
  return pkg?.price ?? 0;
}

export function paymentAmounts(total: number, plan: PaymentPlan) {
  if (plan === "full_100") {
    return { total, deposit: total, balance: 0, full: total };
  }
  const depositRate = plan === "deposit_50" ? 0.5 : 0.6;
  const deposit = Math.round(total * depositRate * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;
  return { total, deposit, balance, full: total };
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
  currency: string;
  paymentLabel: string;
  totalQuoted: number;
  paidToDate: number;
  balanceRemaining: number;
  date: Date;
}) {
  const rows = [
    ["Invoice number", input.invoiceNo],
    ["Date", input.date.toLocaleDateString("en-NA")],
    ["Client", input.clientName],
    ["Email", input.clientEmail],
    ["Service", input.serviceTitle],
    ["Package", input.packageLabel],
    ["This payment", `${input.paymentLabel} — ${formatNad(input.amount)}`],
    ["Package total", formatNad(input.totalQuoted)],
    ["Paid to date", formatNad(input.paidToDate)],
    ["Balance remaining", formatNad(input.balanceRemaining)],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0">${label}</td><td style="padding:8px 12px;color:#1f2937;border-bottom:1px solid #e2e8f0">${value}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,sans-serif;max-width:640px;color:#1f2937">
      <h1 style="color:#0f172a;margin:0 0 4px;font-size:22px">Tax Invoice</h1>
      <p style="margin:0 0 20px;color:#64748b">${BRAND.companyLegal}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:20px">
        ${tableRows}
      </table>
      <p style="font-size:18px;font-weight:700;color:#0f172a">Amount received: ${formatNad(input.amount)}</p>
      <p style="font-size:13px;color:#64748b;margin-top:24px">
        ${COMPANY.name}<br>
        ${COMPANY.poBox}<br>
        ${COMPANY.phones.join(" · ")} · ${COMPANY.email}<br>
        Thank you for your business.
      </p>
    </div>
  `;
}

function buildInvoiceText(input: {
  invoiceNo: string;
  clientName: string;
  serviceTitle: string;
  amount: number;
  paymentLabel: string;
  paidToDate: number;
  balanceRemaining: number;
}) {
  return [
    `Tax Invoice — ${BRAND.companyLegal}`,
    `Invoice: ${input.invoiceNo}`,
    `Client: ${input.clientName}`,
    `Service: ${input.serviceTitle}`,
    `${input.paymentLabel}: ${formatNad(input.amount)}`,
    `Paid to date: ${formatNad(input.paidToDate)}`,
    `Balance remaining: ${formatNad(input.balanceRemaining)}`,
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
  totalQuoted: number;
  paidToDate: number;
  balanceRemaining: number;
  invoiceSuffix: string;
}): Promise<{ ok: boolean; invoiceNo: string; error?: string }> {
  const invoiceNo = invoiceNumber(input.engagementId, input.invoiceSuffix);
  const date = new Date();
  const subject = `${BRAND.companyName} — Invoice ${invoiceNo} (${formatNad(input.amount)})`;
  const html = buildInvoiceHtml({ ...input, invoiceNo, date });
  const text = buildInvoiceText({
    invoiceNo,
    clientName: input.clientName,
    serviceTitle: input.serviceTitle,
    amount: input.amount,
    paymentLabel: input.paymentLabel,
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
  const total = engagement.quotedAmount ?? 0;
  if (total <= 0) {
    return { recorded: false, amount: 0, invoiceSent: false, error: "No quoted amount" };
  }

  const amounts = paymentAmounts(total, plan);
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
      description: paymentLabel,
      paymentMethod: "Recorded automatically",
    },
  });

  const paidTotal = (engagement.paidAmount ?? 0) + amount;
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
      totalQuoted: total,
      paidToDate: paidTotal,
      balanceRemaining: Math.max(0, total - paidTotal),
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
