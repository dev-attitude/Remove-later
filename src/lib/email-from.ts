import { BRAND } from "@/lib/brand";

/** Production sender — override with CONTACT_FROM_EMAIL on Vercel if needed. */
export function getEmailFromAddress(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    `${BRAND.companyName} <hello@gmconsultations.com>`
  );
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function isEmailProviderConfigured(): boolean {
  return isResendConfigured() || isSmtpConfigured();
}
