import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import { sendEmailToClient, isClientEmailConfigured } from "@/lib/services/client-messaging";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

function resetUrl(token: string): string {
  const base = config.appUrl.replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

function buildResetEmail(name: string | null | undefined, link: string) {
  const greeting = name?.trim() ? `Hi ${name.trim().split(" ")[0]},` : "Hi,";
  const subject = `${BRAND.companyName} — Reset your password`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;color:#1f2937">
      <h2 style="color:#0f172a;margin:0 0 12px">Password reset</h2>
      <p>${greeting}</p>
      <p>We received a request to reset your password for ${BRAND.productName}. Click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="margin:28px 0">
        <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
      </p>
      <p style="font-size:13px;color:#64748b">If you did not request this, you can ignore this email. Your password will stay the same.</p>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px">${COMPANY.shortName} · ${COMPANY.email}</p>
    </div>
  `;
  const text = [
    greeting,
    "",
    `Reset your ${BRAND.productName} password:`,
    link,
    "",
    "This link expires in 1 hour. If you did not request a reset, ignore this email.",
    "",
    COMPANY.email,
  ].join("\n");
  return { subject, html, text };
}

/** Request a password reset email. Always returns success to avoid email enumeration. */
export async function requestPasswordReset(email: string): Promise<{
  ok: boolean;
  message: string;
  emailSent?: boolean;
}> {
  const normalized = email.toLowerCase().trim();
  const genericMessage =
    "If an account exists for that email, we sent a password reset link. Check your inbox and spam folder.";

  if (!isClientEmailConfigured()) {
    return {
      ok: false,
      message:
        "Password reset email is not configured on the server yet. Contact support or ask an admin to reset your password.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user?.passwordHash) {
    return { ok: true, message: genericMessage, emailSent: false };
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const { token, tokenHash } = createResetToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = resetUrl(token);
  const { subject, html, text } = buildResetEmail(user.name, link);
  const sent = await sendEmailToClient(normalized, subject, html, text);

  if (!sent.ok && !sent.fallbackSent) {
    console.error("[password-reset] email failed", sent.error);
    return {
      ok: false,
      message: sent.error ?? "Could not send reset email. Try again later or contact support.",
    };
  }

  return { ok: true, message: genericMessage, emailSent: true };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Invalid or expired reset link." };

  const tokenHash = hashResetToken(trimmed);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "Invalid or expired reset link. Request a new one." };
  }

  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
    }),
  ]);

  return { ok: true };
}
