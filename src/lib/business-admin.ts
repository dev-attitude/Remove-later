import { auth } from "@/auth";
import { COMPANY } from "@/lib/site-content";

const ADMIN_ROLES = new Set(["admin", "owner", "business_admin"]);

export function isBusinessAdmin(email: string | null | undefined, role?: string | null) {
  if (role && ADMIN_ROLES.has(role)) return true;
  const normalized = email?.toLowerCase().trim();
  if (!normalized) return false;
  if (normalized === COMPANY.email.toLowerCase()) return true;
  const allowlist = (process.env.BUSINESS_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(normalized);
}

export async function requireBusinessAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user?.id || !email) {
    throw new BusinessAdminError("Sign in to access business management.", 401);
  }

  if (!isBusinessAdmin(email, role)) {
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
