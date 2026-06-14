import { getUnderstandingTopicOptions } from "@/lib/research-suite/understanding-topics";
import { loadUnderstandingTopicContent } from "@/lib/services/understanding-topic-content";
import {
  clearUnderstandingTopicCache,
  getCachedTopicContent,
  getPlatformBooksEpoch,
} from "@/lib/services/understanding-topic-cache";
import { prisma } from "@/lib/db";

export { clearUnderstandingTopicCache, getPlatformBooksEpoch };

/** Pre-generate full guides for topics that are not cached yet (cron / after book upload). */
export async function warmUnderstandingTopicCache(limit = 10): Promise<{
  warmed: number;
  skipped: number;
  errors: string[];
}> {
  const topics = getUnderstandingTopicOptions();
  const booksEpoch = await getPlatformBooksEpoch();
  const now = new Date();

  const cached = await prisma.understandingTopicCache.findMany({
    where: { expiresAt: { gt: now }, booksEpoch },
    select: { module: true, topic: true },
  });
  const cachedKeys = new Set(cached.map((c) => `${c.module}\0${c.topic}`));

  const pending = topics.filter((t) => !cachedKeys.has(`${t.module}\0${t.label}`));
  let warmed = 0;
  const errors: string[] = [];

  for (const t of pending.slice(0, limit)) {
    try {
      await loadUnderstandingTopicContent(t.module, t.label, {
        useAi: true,
        allowBookAi: true,
        refresh: false,
      });
      warmed += 1;
    } catch (e) {
      errors.push(
        `${t.label}: ${e instanceof Error ? e.message : "warm failed"}`
      );
    }
  }

  return { warmed, skipped: pending.length - warmed, errors };
}

/** Returns topics that would benefit from warming (uncached or stale). */
export async function countPendingTopicCache(): Promise<number> {
  const topics = getUnderstandingTopicOptions();
  const booksEpoch = await getPlatformBooksEpoch();
  const now = new Date();
  const cached = await prisma.understandingTopicCache.count({
    where: { expiresAt: { gt: now }, booksEpoch },
  });
  return Math.max(0, topics.length - cached);
}

export async function peekTopicCache(
  module: string,
  topic: string
): Promise<boolean> {
  return (await getCachedTopicContent(module, topic)) !== null;
}
