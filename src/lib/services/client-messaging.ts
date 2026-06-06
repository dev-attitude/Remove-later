import nodemailer from "nodemailer";
import { normalizePhone } from "@/lib/services/contact-notifications";

export type SendResult = { ok: boolean; error?: string };

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

export function isClientSmsConfigured(): boolean {
  return isTwilioConfigured() || isAfricaTalkingConfigured();
}

export function isClientEmailConfigured(): boolean {
  return isEmailConfigured();
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
    const from =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      process.env.SMTP_FROM?.trim() ||
      `Skyrapay Consultations <onboarding@resend.dev>`;

    if (process.env.RESEND_API_KEY?.trim()) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject, html, text }),
      });
      if (!res.ok) throw new Error(await res.text());
    } else {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST!.trim(),
        port: Number(process.env.SMTP_PORT ?? "587"),
        secure: Number(process.env.SMTP_PORT ?? "587") === 465,
        auth: {
          user: process.env.SMTP_USER!.trim(),
          pass: process.env.SMTP_PASS!.trim(),
        },
      });
      await transport.sendMail({ from, to, subject, html, text });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
