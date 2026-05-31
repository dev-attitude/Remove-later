import type { UnifiedPaper } from "./types";

export async function searchArxiv(query: string, limit = 5): Promise<UnifiedPaper[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const xml = await res.text();
  const entries = xml.split("<entry>").slice(1);

  return entries.map((entry, i) => {
    const title =
      entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, " ").trim() ??
      "Untitled";
    const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)]
      .map((m) => m[1])
      .slice(0, 4)
      .join("; ");
    const published = entry.match(/<published>(\d{4})/)?.[1];
    const id = entry.match(/<id>(.*?)<\/id>/)?.[1] ?? `arxiv-${i}`;
    const summary = entry
      .match(/<summary>([\s\S]*?)<\/summary>/)?.[1]
      ?.replace(/\s+/g, " ")
      .trim();

    return {
      id: `arxiv-${i}`,
      title,
      authors: authors || "Unknown",
      year: published ? parseInt(published, 10) : new Date().getFullYear(),
      source: "arXiv",
      sourceId: "arxiv",
      abstract: summary?.slice(0, 300),
      url: id,
      citations: 0,
      gap: "Preprint — confirm peer-reviewed version if citing",
    };
  });
}
