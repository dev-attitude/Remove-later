import { BRAND } from "@/lib/brand";

/** Production sender — requires verified domain on Resend. */
export function getEmailFromAddress(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    `${BRAND.companyName} <hello@gmconsultations.com>`
  );
}

/** Resend sandbox sender — only delivers to the Resend account owner email. */
export function getResendSandboxFromAddress(): string {
  return `${BRAND.companyName} <onboarding@resend.dev>`;
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
