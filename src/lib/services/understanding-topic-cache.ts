import { prisma } from "@/lib/db";
import type { UnderstandingTopicContent } from "@/lib/services/understanding-topic-content";

export const TOPIC_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getPlatformBooksEpoch(): Promise<string> {
  const agg = await prisma.understandingBook.aggregate({
    where: { userId: null },
    _count: { id: true },
    _max: { updatedAt: true },
  });
  return `${agg._count.id}-${agg._max.updatedAt?.getTime() ?? 0}`;
}

export async function getCachedTopicContent(
  module: string,
  topic: string
): Promise<(UnderstandingTopicContent & { fromCache?: boolean }) | null> {
  const booksEpoch = await getPlatformBooksEpoch();
  const row = await prisma.understandingTopicCache.findUnique({
    where: { module_topic: { module, topic } },
  });

  if (!row || row.expiresAt <= new Date() || row.booksEpoch !== booksEpoch) {
    if (row && (row.expiresAt <= new Date() || row.booksEpoch !== booksEpoch)) {
      await prisma.understandingTopicCache.delete({ where: { id: row.id } }).catch(() => {});
    }
    return null;
  }

  try {
    const parsed = JSON.parse(row.payload) as UnderstandingTopicContent;
    return { ...parsed, fromCache: true };
  } catch {
    await prisma.understandingTopicCache.delete({ where: { id: row.id } }).catch(() => {});
    return null;
  }
}

export async function setCachedTopicContent(
  module: string,
  topic: string,
  content: UnderstandingTopicContent
): Promise<void> {
  const booksEpoch = await getPlatformBooksEpoch();
  const expiresAt = new Date(Date.now() + TOPIC_CACHE_TTL_MS);
  const payload = JSON.stringify(content);

  await prisma.understandingTopicCache.upsert({
    where: { module_topic: { module, topic } },
    create: { module, topic, booksEpoch, payload, expiresAt },
    update: { booksEpoch, payload, expiresAt },
  });
}

export async function clearUnderstandingTopicCache(): Promise<number> {
  const result = await prisma.understandingTopicCache.deleteMany({});
  return result.count;
}
