import { normalizePhone } from "@/lib/services/contact-notifications";
import { COMPANY } from "@/lib/site-content";
import {
  getEmailFromAddress,
  isEmailProviderConfigured,
  isResendConfigured,
  isSmtpConfigured,
} from "@/lib/email-from";

export type SendResult = { ok: boolean; error?: string; fallbackSent?: boolean };

function isEmailConfigured(): boolean {
  return isEmailProviderConfigured();
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

export function isClientSmsConfigured(): boolean {
  return isTwilioConfigured() || isAfricaTalkingConfigured();
}

export function isClientEmailConfigured(): boolean {
  return isEmailConfigured();
}

function getInvoiceFallbackEmail(): string | null {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.BUSINESS_ADMIN_EMAILS?.split(",")[0]?.trim() ||
    COMPANY.email ||
    null
  );
}

function parseResendError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    const msg = parsed.message ?? body;
    if (msg.includes("verify a domain") || msg.includes("testing emails")) {
      return "Resend is in test mode — verify gmconsultations.com at resend.com/domains and set CONTACT_FROM_EMAIL (e.g. hello@gmconsultations.com) on Vercel to email clients.";
    }
    return msg;
  } catch {
    return body;
  }
}

async function sendViaResend(input: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; status: number; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (res.ok) return { ok: true, status: res.status };
  const errText = await res.text();
  return { ok: false, status: res.status, error: parseResendError(errText) };
}

async function sendViaSmtp(input: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port: Number(process.env.SMTP_PORT ?? "587"),
      secure: Number(process.env.SMTP_PORT ?? "587") === 465,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASS!.trim(),
      },
    });
    await transport.sendMail({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
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
  if (!res.ok) throw new Error(`Twilio (${res.status}): ${await res.text()}`);
}

async function sendAfricaTalkingSms(to: string, body: string): Promise<void> {
  const username = process.env.AFRICASTALKING_USERNAME!.trim();
  const apiKey = process.env.AFRICASTALKING_API_KEY!.trim();
  const senderId = process.env.AFRICASTALKING_SENDER_ID?.trim();
  const params = new URLSearchParams({ username, to, message: body });
  if (senderId) params.set("from", senderId);
  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { apiKey, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: params.toString(),
  });
  const data = (await res.json()) as {
    SMSMessageData?: { Recipients?: { status?: string; statusCode?: number }[] };
    errorMessage?: string;
  };
  if (!res.ok) throw new Error(data.errorMessage ?? `HTTP ${res.status}`);
  const recipient = data.SMSMessageData?.Recipients?.[0];
  if (recipient?.status && recipient.status !== "Success") {
    throw new Error(`${recipient.status} (code ${recipient.statusCode ?? "?"})`);
  }
}

export async function sendSmsToClient(phone: string, body: string): Promise<SendResult> {
  if (!isClientSmsConfigured()) {
    return { ok: false, error: "SMS provider not configured" };
  }
  try {
    const to = normalizePhone(phone);
    if (isAfricaTalkingConfigured()) {
      await sendAfricaTalkingSms(to, body);
    } else {
      await sendTwilioSms(to, body);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function sendEmailToClient(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email not configured" };
  }
  try {
    const from = getEmailFromAddress();

    if (isResendConfigured()) {
      const primary = await sendViaResend({ from, to, subject, html, text });
      if (primary.ok) return { ok: true };

      if (isSmtpConfigured()) {
        const smtp = await sendViaSmtp({ from, to, subject, html, text });
        if (smtp.ok) return { ok: true };
      }

      const fallbackTo = getInvoiceFallbackEmail();
      const isTestModeBlock =
        primary.status === 403 &&
        (primary.error?.includes("test mode") || primary.error?.includes("testing")) &&
        fallbackTo &&
        fallbackTo.toLowerCase() !== to.toLowerCase();

      if (isTestModeBlock) {
        const fallback = await sendViaResend({
          from,
          to: fallbackTo,
          subject: `[Forward to ${to}] ${subject}`,
          html: `${html}<p style="margin-top:16px;padding:12px;background:#fef3c7;color:#92400e;font-size:13px">Please forward this to the client at <strong>${to}</strong>.</p>`,
          text: `${text}\n\n[Forward to client: ${to}]`,
        });
        if (fallback.ok) {
          return {
            ok: false,
            fallbackSent: true,
            error: `${primary.error} Copy sent to ${fallbackTo} — please forward to the client.`,
          };
        }
      }

      return { ok: false, error: primary.error ?? "Email send failed" };
    }

    if (isSmtpConfigured()) {
      const smtp = await sendViaSmtp({ from, to, subject, html, text });
      return smtp.ok ? { ok: true } : { ok: false, error: smtp.error ?? "SMTP send failed" };
    }

    return { ok: false, error: "Email not configured" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
