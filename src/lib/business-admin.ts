import { auth } from "@/auth";
import { COMPANY } from "@/lib/site-content";

/** Only these emails may access Business Manager (/manage). */
const DEFAULT_BUSINESS_STAFF_EMAILS = [
  COMPANY.email.toLowerCase(),
  "gazzy@gmconsultations.com",
] as const;

export function getBusinessStaffEmails(): string[] {
  const fromEnv = (process.env.BUSINESS_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...DEFAULT_BUSINESS_STAFF_EMAILS, ...fromEnv])];
}

export function isBusinessAdmin(email: string | null | undefined) {
  const normalized = email?.toLowerCase().trim();
  if (!normalized) return false;
  return getBusinessStaffEmails().includes(normalized);
}

export async function requireBusinessAdmin() {
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user?.id || !email) {
    throw new BusinessAdminError("Sign in to access business management.", 401);
  }

  if (!isBusinessAdmin(email)) {
    throw new BusinessAdminError("You do not have access to business management.", 403);
  }

  return session;
}

export class BusinessAdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
