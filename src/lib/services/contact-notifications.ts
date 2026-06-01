import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/site-content";

export type ContactInquiry = {
  type: "contact" | "purchase";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  packageId?: string;
  packageName?: string;
};

export type NotificationResult = {
  email: boolean;
  sms: boolean;
  emailConfigured: boolean;
  smsConfigured: boolean;
};

function notifyEmail(): string {
  return process.env.CONTACT_NOTIFY_EMAIL?.trim() || COMPANY.email;
}

function notifyPhones(): string[] {
  const fromEnv = process.env.CONTACT_NOTIFY_PHONES?.trim();
  if (fromEnv) {
    return fromEnv.split(/[,;]/).map((p) => normalizePhone(p.trim())).filter(Boolean);
  }
  return COMPANY.phones.map((p) => normalizePhone(p.replace(/\s/g, "")));
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("264")) return `+${digits}`;
  if (digits.startsWith("0")) return `+264${digits.slice(1)}`;
  return `+${digits}`;
}

function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim())
  );
}

function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_SMS_FROM?.trim()
  );
}

function inquiryTitle(inquiry: ContactInquiry): string {
  if (inquiry.type === "purchase") {
    return `Shop quote request — ${inquiry.packageName ?? inquiry.packageId ?? "package"}`;
  }
  const topics: Record<string, string> = {
    general: "General inquiry",
    it: "IT consulting",
    business: "Business consultation",
    gadgets: "Gadgets & hardware",
    development: "System / software development",
    website: "Website or app project",
  };
  return topics[inquiry.subject ?? ""] ?? inquiry.subject ?? "Contact form";
}

function buildEmailHtml(inquiry: ContactInquiry): string {
  const title = inquiryTitle(inquiry);
  const rows = [
    ["Type", inquiry.type === "purchase" ? "Purchase / quote" : "Contact"],
    ["Topic", title],
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone || "—"],
    ...(inquiry.packageName ? [["Package", inquiry.packageName]] : []),
    ...(inquiry.packageId && !inquiry.packageName ? [["Package ID", inquiry.packageId]] : []),
    ["Message", (inquiry.message || "—").replace(/\n/g, "<br>")],
    ["Received", new Date().toLocaleString("en-NA", { timeZone: "Africa/Windhoek" })],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#0f172a;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#1f2937">${value}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px">
      <h2 style="color:#0f172a;margin:0 0 16px">New website inquiry</h2>
      <p style="color:#64748b;margin:0 0 20px">${COMPANY.name} — ${title}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        ${tableRows}
      </table>
      <p style="margin-top:24px;font-size:13px;color:#64748b">Reply directly to this email to reach the client.</p>
    </div>
  `;
}

function buildEmailText(inquiry: ContactInquiry): string {
  const title = inquiryTitle(inquiry);
  return [
    `New website inquiry — ${COMPANY.name}`,
    "",
    `Type: ${inquiry.type}`,
    `Topic: ${title}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "—"}`,
    inquiry.packageName ? `Package: ${inquiry.packageName}` : null,
    inquiry.packageId && !inquiry.packageName ? `Package ID: ${inquiry.packageId}` : null,
    "",
    "Message:",
    inquiry.message || "—",
    "",
    `Received: ${new Date().toISOString()}`,
  ]
    .filter((line): line is string => line != null)
    .join("\n");
}

function buildSmsBody(inquiry: ContactInquiry): string {
  const title = inquiryTitle(inquiry);
  const pkg = inquiry.packageName ? ` | ${inquiry.packageName}` : "";
  const clientPhone = inquiry.phone ? ` | Client: ${inquiry.phone}` : "";
  const text = `Skyrapay: ${title} from ${inquiry.name}${pkg}${clientPhone}. Email: ${inquiry.email}`;
  return text.length > 320 ? `${text.slice(0, 317)}...` : text;
}

async function sendViaResend(inquiry: ContactInquiry, to: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    `${COMPANY.shortName} <onboarding@resend.dev>`;
  const subject = `[${COMPANY.shortName}] ${inquiryTitle(inquiry)} — ${inquiry.name}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject,
      html: buildEmailHtml(inquiry),
      text: buildEmailText(inquiry),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend failed (${res.status}): ${err}`);
  }
}

async function sendViaSmtp(inquiry: ContactInquiry, to: string): Promise<void> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    `${COMPANY.shortName} <${user}>`;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from,
    to,
    replyTo: inquiry.email,
    subject: `[${COMPANY.shortName}] ${inquiryTitle(inquiry)} — ${inquiry.name}`,
    html: buildEmailHtml(inquiry),
    text: buildEmailText(inquiry),
  });
}

async function sendEmail(inquiry: ContactInquiry): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  const to = notifyEmail();
  try {
    if (process.env.RESEND_API_KEY?.trim()) {
      await sendViaResend(inquiry, to);
    } else {
      await sendViaSmtp(inquiry, to);
    }
    return true;
  } catch (e) {
    console.error("[contact-notify] email failed:", e);
    return false;
  }
}

async function sendTwilioSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const token = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = process.env.TWILIO_SMS_FROM!.trim();

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: to, From: from, Body: body });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio failed (${res.status}): ${err}`);
  }
}

async function sendSms(inquiry: ContactInquiry): Promise<boolean> {
  if (!isSmsConfigured()) return false;

  const body = buildSmsBody(inquiry);
  const phones = notifyPhones();
  if (phones.length === 0) return false;

  try {
    await Promise.all(phones.map((to) => sendTwilioSms(to, body)));
    return true;
  } catch (e) {
    console.error("[contact-notify] sms failed:", e);
    return false;
  }
}

export function isContactNotifyConfigured(): boolean {
  return isEmailConfigured() || isSmsConfigured();
}

export async function notifyContactInquiry(inquiry: ContactInquiry): Promise<NotificationResult> {
  const emailConfigured = isEmailConfigured();
  const smsConfigured = isSmsConfigured();

  if (!emailConfigured && !smsConfigured) {
    console.info("[contact-notify] not configured — logging only:", {
      ...inquiry,
      notifyEmail: notifyEmail(),
      notifyPhones: notifyPhones(),
    });
    return { email: false, sms: false, emailConfigured, smsConfigured };
  }

  const [email, sms] = await Promise.all([
    emailConfigured ? sendEmail(inquiry) : Promise.resolve(false),
    smsConfigured ? sendSms(inquiry) : Promise.resolve(false),
  ]);

  return { email, sms, emailConfigured, smsConfigured };
}
