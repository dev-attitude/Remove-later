import { prisma } from "@/lib/db";

export const FULL_SERVICE_ACTIONS = [
  "ai.generate",
  "ai.writing",
  "research.topics",
  "research.curriculum",
  "research.understanding",
] as const;

export type FullServiceAction = (typeof FULL_SERVICE_ACTIONS)[number];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type TrialStatus = {
  /** Total trial length in days (from env, default 3) */
  daysTotal: number;
  /** Whole days left before trial ends (0 when expired) */
  daysRemaining: number;
  trialEndsAt: Date;
  isTrialActive: boolean;
  hasActiveSubscription: boolean;
  /** @deprecated Use daysRemaining — kept for API responses */
  limit: number;
  /** @deprecated Days elapsed since signup */
  used: number;
  /** @deprecated Use daysRemaining */
  remaining: number;
};

export function trialDays(): number {
  const raw = process.env.TRIAL_DAYS?.trim();
  const n = raw ? Number(raw) : 3;
  if (!Number.isFinite(n) || n <= 0) return 3;
  return Math.floor(n);
}

export function trialExpiredMessage(): string {
  const days = trialDays();
  return `Your ${days}-day free trial has ended. Please subscribe to continue.`;
}

export function trialEndsAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + trialDays() * MS_PER_DAY);
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  const daysTotal = trialDays();
  const subscribed = await hasActiveSubscription(userId);
  if (subscribed) {
    const farFuture = new Date(Date.now() + 365 * MS_PER_DAY);
    return {
      daysTotal,
      daysRemaining: Number.MAX_SAFE_INTEGER,
      trialEndsAt: farFuture,
      isTrialActive: true,
      hasActiveSubscription: true,
      limit: daysTotal,
      used: 0,
      remaining: Number.MAX_SAFE_INTEGER,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  if (!user) {
    const ended = new Date(0);
    return {
      daysTotal,
      daysRemaining: 0,
      trialEndsAt: ended,
      isTrialActive: false,
      hasActiveSubscription: false,
      limit: daysTotal,
      used: daysTotal,
      remaining: 0,
    };
  }

  const endsAt = trialEndsAt(user.createdAt);
  const msLeft = endsAt.getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(msLeft / MS_PER_DAY));
  const isTrialActive = msLeft > 0;
  const msElapsed = Date.now() - user.createdAt.getTime();
  const daysUsed = Math.min(daysTotal, Math.floor(msElapsed / MS_PER_DAY));

  return {
    daysTotal,
    daysRemaining,
    trialEndsAt: endsAt,
    isTrialActive,
    hasActiveSubscription: false,
    limit: daysTotal,
    used: daysUsed,
    remaining: daysRemaining,
  };
}

export async function enforceTrialOrSubscription(userId: string): Promise<TrialStatus> {
  const status = await getTrialStatus(userId);
  if (status.hasActiveSubscription) return status;
  if (status.isTrialActive) return status;
  const err = new Error("TRIAL_EXHAUSTED");
  (err as Error & { code?: string }).code = "TRIAL_EXHAUSTED";
  throw err;
}
