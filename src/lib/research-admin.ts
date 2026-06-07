import { prisma } from "@/lib/db";

const ADMIN_ROLES = new Set(["admin", "owner", "platform_admin"]);

function adminEmailAllowlist(): string[] {
  return (process.env.RESEARCH_ADMIN_EMAILS || process.env.PLATFORM_TEXTBOOK_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isResearchAdmin(email?: string | null, role?: string | null): boolean {
  if (role && ADMIN_ROLES.has(role)) return true;
  if (email && adminEmailAllowlist().includes(email.toLowerCase().trim())) return true;
  return false;
}

export async function isResearchAdminUserId(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });
  return user ? isResearchAdmin(user.email, user.role) : false;
}
