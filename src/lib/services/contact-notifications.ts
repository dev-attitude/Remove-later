import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/site-content";
import { getEmailFromAddress } from "@/lib/email-from";

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
  smsProvider?: "twilio" | "africastalking";
  smsError?: string;
  notifyPhones: string[];
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

/** E.164 format required by Twilio / Africa's Talking */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("264")) return `+${digits}`;
  if (digits.startsWith("0")) return `+264${digits.slice(1)}`;
  if (digits.length === 9) return `+264${digits}`;
  return `+${digits}`;
}

function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim())
  );
}

function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_SMS_FROM?.trim()
  );
}

function isAfricaTalkingConfigured(): boolean {
  return Boolean(
    process.env.AFRICASTALKING_USERNAME?.trim() && process.env.AFRICASTALKING_API_KEY?.trim()
  );
}

function isSmsConfigured(): boolean {
  return isTwilioConfigured() || isAfricaTalkingConfigured();
}

function smsProvider(): "twilio" | "africastalking" | undefined {
  if (isAfricaTalkingConfigured()) return "africastalking";
  if (isTwilioConfigured()) return "twilio";
  return undefined;
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
    "student-assistance": "Student assistance",
    "assignment-writing": "Assignment writing",
    "research-writing": "Research writing",
  };
  return topics[inquiry.subject ?? ""] ?? inquiry.subject ?? "Contact form";
}

function adminSmsStatusNote(result: Pick<NotificationResult, "sms" | "smsConfigured" | "smsError" | "notifyPhones">): string {
  if (!result.smsConfigured) {
    return `<p style="margin-top:16px;padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e"><strong>SMS not sent:</strong> No SMS provider configured on the server (add Twilio or Africa&apos;s Talking in Vercel).</p>`;
  }
  if (!result.sms) {
    return `<p style="margin-top:16px;padding:12px;background:#fee2e2;border-radius:8px;font-size:13px;color:#991b1b"><strong>SMS failed:</strong> ${result.smsError ?? "Unknown error"}. Numbers: ${result.notifyPhones.join(", ")}</p>`;
  }
  return `<p style="margin-top:16px;padding:12px;background:#ecfdf5;border-radius:8px;font-size:13px;color:#065f46"><strong>SMS sent</strong> to ${result.notifyPhones.join(" and ")}.</p>`;
}

function buildEmailHtml(inquiry: ContactInquiry, smsStatus: Pick<NotificationResult, "sms" | "smsConfigured" | "smsError" | "notifyPhones">): string {
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
      ${adminSmsStatusNote(smsStatus)}
    </div>
  `;
}

function buildEmailText(inquiry: ContactInquiry, smsStatus: Pick<NotificationResult, "sms" | "smsConfigured" | "smsError" | "notifyPhones">): string {
  const title = inquiryTitle(inquiry);
  let smsLine = "";
  if (!smsStatus.smsConfigured) smsLine = "\n\n[Admin] SMS not sent — no SMS provider configured on server.";
  else if (!smsStatus.sms) smsLine = `\n\n[Admin] SMS failed: ${smsStatus.smsError ?? "unknown"}`;
  else smsLine = `\n\n[Admin] SMS sent to ${smsStatus.notifyPhones.join(", ")}.`;

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
    smsLine,
  ]
    .filter((line): line is string => line != null)
    .join("\n");
}

function buildSmsBody(inquiry: ContactInquiry): string {
  const title = inquiryTitle(inquiry);
  const pkg = inquiry.packageName ? ` | ${inquiry.packageName}` : "";
  const clientPhone = inquiry.phone ? ` | ${inquiry.phone}` : "";
  const text = `Skyrapay: ${title} from ${inquiry.name}${pkg}${clientPhone}. Email: ${inquiry.email}`;
  return text.length > 320 ? `${text.slice(0, 317)}...` : text;
}

async function sendViaResend(
  inquiry: ContactInquiry,
  to: string,
  smsStatus: Pick<NotificationResult, "sms" | "smsConfigured" | "smsError" | "notifyPhones">
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = getEmailFromAddress();
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
      html: buildEmailHtml(inquiry, smsStatus),
      text: buildEmailText(inquiry, smsStatus),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend failed (${res.status}): ${err}`);
  }
}

async function sendViaSmtp(
  inquiry: ContactInquiry,
  to: string,
  smsStatus: Pick<NotificationResult, "sms" | "smsConfigured" | "smsError" | "notifyPhones">
): Promise<void> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const from = process.env.SMTP_FROM?.trim() || getEmailFromAddress();

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
    html: buildEmailHtml(inquiry, smsStatus),
    text: buildEmailText(inquiry, smsStatus),
  });
}

async function sendTwilioSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const token = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = normalizePhone(process.env.TWILIO_SMS_FROM!.trim());

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
    throw new Error(`Twilio to ${to} (${res.status}): ${err}`);
  }
}

async function sendAfricaTalkingSms(to: string, body: string): Promise<void> {
  const username = process.env.AFRICASTALKING_USERNAME!.trim();
  const apiKey = process.env.AFRICASTALKING_API_KEY!.trim();
  const senderId = process.env.AFRICASTALKING_SENDER_ID?.trim();

  const params = new URLSearchParams({
    username,
    to,
    message: body,
  });
  if (senderId) params.set("from", senderId);

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  const data = (await res.json()) as {
    SMSMessageData?: { Recipients?: { status?: string; number?: string; statusCode?: number }[] };
    errorMessage?: string;
  };

  if (!res.ok) {
    throw new Error(`Africa's Talking to ${to} (${res.status}): ${data.errorMessage ?? JSON.stringify(data)}`);
  }

  const recipient = data.SMSMessageData?.Recipients?.[0];
  if (recipient?.status && recipient.status !== "Success") {
    throw new Error(
      `Africa's Talking to ${to}: ${recipient.status} (code ${recipient.statusCode ?? "?"})`
    );
  }
}

async function sendSms(inquiry: ContactInquiry): Promise<{ ok: boolean; error?: string }> {
  if (!isSmsConfigured()) {
    console.warn(
      "[contact-notify] SMS skipped — add TWILIO_* or AFRICASTALKING_* in Vercel Environment Variables"
    );
    return { ok: false, error: "SMS provider not configured" };
  }

  const body = buildSmsBody(inquiry);
  const phones = notifyPhones();
  if (phones.length === 0) {
    return { ok: false, error: "No notify phone numbers" };
  }

  const provider = smsProvider()!;
  const errors: string[] = [];

  for (const to of phones) {
    try {
      if (provider === "africastalking") {
        await sendAfricaTalkingSms(to, body);
      } else {
        await sendTwilioSms(to, body);
      }
      console.info(`[contact-notify] SMS sent via ${provider} to ${to}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[contact-notify] SMS failed for ${to}:`, msg);
      errors.push(msg);
    }
  }

  if (errors.length === phones.length) {
    return { ok: false, error: errors.join(" | ") };
  }
  if (errors.length > 0) {
    return { ok: true, error: `Partial: ${errors.join(" | ")}` };
  }
  return { ok: true };
}

export function isContactNotifyConfigured(): boolean {
  return isEmailConfigured() || isSmsConfigured();
}

export async function notifyContactInquiry(inquiry: ContactInquiry): Promise<NotificationResult> {
  const emailConfigured = isEmailConfigured();
  const smsConfigured = isSmsConfigured();
  const phones = notifyPhones();

  const base: NotificationResult = {
    email: false,
    sms: false,
    emailConfigured,
    smsConfigured,
    smsProvider: smsProvider(),
    notifyPhones: phones,
  };

  if (!emailConfigured && !smsConfigured) {
    console.info("[contact-notify] not configured — logging only:", {
      name: inquiry.name,
      email: inquiry.email,
      notifyEmail: notifyEmail(),
      notifyPhones: phones,
    });
    return base;
  }

  // Send SMS first so the admin email can report SMS status
  let smsResult: { ok: boolean; error?: string } = { ok: false };
  if (smsConfigured) {
    smsResult = await sendSms(inquiry);
    base.sms = smsResult.ok;
    base.smsError = smsResult.error;
  } else {
    console.warn("[contact-notify] SMS not configured — only email will be sent");
  }

  const smsStatus = {
    sms: base.sms,
    smsConfigured,
    smsError: base.smsError,
    notifyPhones: phones,
  };

  if (emailConfigured) {
    try {
      const to = notifyEmail();
      if (process.env.RESEND_API_KEY?.trim()) {
        await sendViaResend(inquiry, to, smsStatus);
      } else {
        await sendViaSmtp(inquiry, to, smsStatus);
      }
      base.email = true;
    } catch (e) {
      console.error("[contact-notify] email failed:", e);
    }
  }

  console.info("[contact-notify] result", {
    email: base.email,
    sms: base.sms,
    smsConfigured,
    smsProvider: base.smsProvider,
    phones,
  });

  return base;
}
