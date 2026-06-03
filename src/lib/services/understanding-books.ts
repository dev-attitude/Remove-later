import { prisma } from "@/lib/db";

export const MAX_PLATFORM_BOOKS = 20;
export const MAX_EXCERPT_CHARS_PER_BOOK = 3_500;
export const MAX_TOTAL_BOOK_CONTEXT_CHARS = 14_000;

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

function topicKeywords(module: string, topic: string): string[] {
  const raw = `${topic} ${module.replace(/^MODULE \d+:\s*/i, "")}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
  const words = raw.split(/\s+/).filter((w) => w.length > 3);
  return [...new Set([topic.toLowerCase(), ...words])];
}

/** Score paragraphs in a book and return the most relevant excerpt for a topic */
export function extractRelevantExcerpt(
  fullText: string,
  module: string,
  topic: string,
  maxChars = MAX_EXCERPT_CHARS_PER_BOOK
): string {
  const keywords = topicKeywords(module, topic);
  const paragraphs = fullText
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 50);

  if (paragraphs.length === 0) {
    return fullText.slice(0, maxChars).trim();
  }

  const scored = paragraphs.map((p) => {
    const lower = p.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += Math.min(kw.length, 12);
    }
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const picked: string[] = [];
  let len = 0;
  const ordered =
    scored[0]?.score > 0
      ? scored
      : paragraphs.map((p, i) => ({ p, score: paragraphs.length - i }));

  for (const { p } of ordered) {
    if (len >= maxChars) break;
    if (picked.some((x) => x === p)) continue;
    picked.push(p);
    len += p.length + 2;
  }

  return picked.join("\n\n").slice(0, maxChars);
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

/** Shared course textbooks — used for every student when they open a topic */
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

  const excerpts: BookExcerpt[] = [];
  let total = 0;

  for (const book of applicable) {
    if (!book.textContent.trim()) continue;
    const excerpt = extractRelevantExcerpt(book.textContent, module, topic);
    if (!excerpt.trim()) continue;
    const slice = excerpt.slice(0, MAX_EXCERPT_CHARS_PER_BOOK);
    if (total + slice.length > MAX_TOTAL_BOOK_CONTEXT_CHARS) break;
    excerpts.push({ bookId: book.id, title: book.title, excerpt: slice });
    total += slice.length;
  }

  return excerpts;
}

export function formatBookExcerptsForPrompt(excerpts: BookExcerpt[]): string {
  if (excerpts.length === 0) return "";
  return excerpts
    .map((b, i) => `[Textbook ${i + 1}: ${b.title}]\n${b.excerpt}`)
    .join("\n\n---\n\n");
}
