import { prisma } from "@/lib/db";
import {
  buildTopicSearchPhrases,
  extractRelevantExcerpt,
  phraseMatchScore,
} from "@/lib/services/book-topic-match";

export const MAX_PLATFORM_BOOKS = 20;
export const MAX_EXCERPT_CHARS_PER_BOOK = 4_500;
export const MAX_TOTAL_BOOK_CONTEXT_CHARS = 16_000;

export type UnderstandingBookRecord = {
  id: string;
  title: string;
  fileName: string;
  moduleScope: string | null;
  charCount: number;
  createdAt: Date;
};

export type BookExcerpt = {
  bookId: string;
  title: string;
  excerpt: string;
  /** Relevance score for this topic (higher = better match) */
  relevance: number;
};

/** Who may upload or remove shared course textbooks */
export function canManagePlatformTextbooks(user: {
  role?: string | null;
  email?: string | null;
}): boolean {
  const role = (user.role || "").toLowerCase();
  if (["admin", "owner", "supervisor", "institution"].includes(role)) return true;

  const email = (user.email || "").toLowerCase().trim();
  if (!email) return false;

  const allowlist = (process.env.PLATFORM_TEXTBOOK_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  return allowlist.includes(email);
}

export async function listPlatformTextbooks(): Promise<UnderstandingBookRecord[]> {
  const rows = await prisma.understandingBook.findMany({
    where: { userId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      fileName: true,
      moduleScope: true,
      textContent: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    fileName: r.fileName,
    moduleScope: r.moduleScope,
    charCount: r.textContent.length,
    createdAt: r.createdAt,
  }));
}

/** Shared course textbooks — topic-specific passages from each book */
export async function getBookExcerptsForTopic(
  module: string,
  topic: string
): Promise<BookExcerpt[]> {
  const books = await prisma.understandingBook.findMany({
    where: { userId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      moduleScope: true,
      textContent: true,
    },
  });

  const moduleKey = module.trim().toLowerCase();
  const applicable = books.filter(
    (b) =>
      !b.moduleScope ||
      b.moduleScope.trim().toLowerCase() === moduleKey ||
      moduleKey.includes(b.moduleScope.trim().toLowerCase().slice(0, 20))
  );

  const phrases = buildTopicSearchPhrases(module, topic);
  const excerpts: BookExcerpt[] = [];
  let total = 0;

  for (const book of applicable) {
    if (!book.textContent.trim()) continue;

    const excerpt = extractRelevantExcerpt(
      book.textContent,
      module,
      topic,
      MAX_EXCERPT_CHARS_PER_BOOK
    );
    if (!excerpt.trim()) continue;

    const relevance = phraseMatchScore(excerpt, phrases);
    const slice = excerpt.slice(0, MAX_EXCERPT_CHARS_PER_BOOK);
    if (total + slice.length > MAX_TOTAL_BOOK_CONTEXT_CHARS) break;

    excerpts.push({
      bookId: book.id,
      title: book.title,
      excerpt: slice,
      relevance,
    });
    total += slice.length;
  }

  return excerpts.sort((a, b) => b.relevance - a.relevance);
}

export function formatBookExcerptsForPrompt(excerpts: BookExcerpt[]): string {
  if (excerpts.length === 0) return "";
  return excerpts
    .map((b, i) => `[Textbook ${i + 1}: ${b.title}]\n${b.excerpt}`)
    .join("\n\n---\n\n");
}
