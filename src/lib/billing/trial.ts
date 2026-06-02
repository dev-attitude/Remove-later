import { prisma } from "@/lib/db";

export const FULL_SERVICE_ACTIONS = [
  "ai.generate",
  "ai.writing",
  "research.topics",
  "research.curriculum",
] as const;

export type FullServiceAction = (typeof FULL_SERVICE_ACTIONS)[number];

export type TrialStatus = {
  limit: number;
  used: number;
  remaining: number;
  hasActiveSubscription: boolean;
};

export function trialLimit(): number {
  const raw = process.env.TRIAL_FREE_USES?.trim();
  const n = raw ? Number(raw) : 5;
  if (!Number.isFinite(n) || n <= 0) return 5;
  return Math.floor(n);
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  const limit = trialLimit();
  const active = await hasActiveSubscription(userId);
  if (active) {
    return { limit, used: 0, remaining: Number.MAX_SAFE_INTEGER, hasActiveSubscription: true };
  }

  const used = await prisma.usageLog.count({
    where: {
      userId,
      action: { in: [...FULL_SERVICE_ACTIONS] },
    },
  });

  const remaining = Math.max(0, limit - used);
  return { limit, used, remaining, hasActiveSubscription: false };
}

export async function enforceTrialOrSubscription(userId: string): Promise<TrialStatus> {
  const status = await getTrialStatus(userId);
  if (status.hasActiveSubscription) return status;
  if (status.remaining > 0) return status;
  const err = new Error("TRIAL_EXHAUSTED");
  (err as Error & { code?: string }).code = "TRIAL_EXHAUSTED";
  throw err;
}

