import type { UnifiedPaper } from "./types";

export async function searchSemanticScholar(
  query: string,
  limit = 5,
  apiKey?: string
): Promise<UnifiedPaper[]> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,year,authors,citationCount,abstract,externalIds,url`,
    { headers, next: { revalidate: 3600 } }
  );

  if (!res.ok) return [];

  const data = (await res.json()) as {
    data?: Array<{
      paperId?: string;
      title?: string;
      year?: number;
      citationCount?: number;
      abstract?: string;
      url?: string;
      externalIds?: { DOI?: string };
      authors?: Array<{ name?: string }>;
    }>;
  };

  return (data.data ?? []).map((p) => ({
    id: p.paperId ?? crypto.randomUUID(),
    title: p.title ?? "Untitled",
    authors: p.authors?.map((a) => a.name).filter(Boolean).join("; ") || "Unknown",
    year: p.year ?? new Date().getFullYear(),
    source: "Semantic Scholar",
    sourceId: "semantic-scholar",
    abstract: p.abstract?.slice(0, 300),
    doi: p.externalIds?.DOI,
    url: p.url,
    citations: p.citationCount ?? 0,
    gap: "Check citation network and related papers in Semantic Scholar",
  }));
}
