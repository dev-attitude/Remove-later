import { config, getRuntimeMode } from "@/lib/config";
import { mockLiteratureSearch } from "@/lib/mock-ai";

export type LiteratureResult = {
  title: string;
  authors: string;
  year: number;
  source: string;
  citations: number;
  gap: string;
  paperId?: string;
};

export async function searchLiterature(
  query: string
): Promise<{ results: LiteratureResult[]; mode: "demo" | "live" }> {
  if (getRuntimeMode() === "demo") {
    return { results: mockLiteratureSearch(query), mode: "demo" };
  }

  try {
    const headers: HeadersInit = { Accept: "application/json" };
    if (config.semanticScholar.apiKey) {
      headers["x-api-key"] = config.semanticScholar.apiKey;
    }

    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,year,authors,citationCount,externalIds`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return { results: mockLiteratureSearch(query), mode: "demo" };
    }

    const data = (await res.json()) as {
      data?: Array<{
        title?: string;
        year?: number;
        citationCount?: number;
        paperId?: string;
        authors?: Array<{ name?: string }>;
      }>;
    };

    const results: LiteratureResult[] = (data.data ?? []).map((p) => ({
      title: p.title ?? "Untitled",
      authors:
        p.authors?.map((a) => a.name).filter(Boolean).join("; ") || "Unknown",
      year: p.year ?? new Date().getFullYear(),
      source: "Semantic Scholar",
      citations: p.citationCount ?? 0,
      gap: "Review abstract and methods for alignment with your study",
      paperId: p.paperId,
    }));

    return {
      results: results.length > 0 ? results : mockLiteratureSearch(query),
      mode: results.length > 0 ? "live" : "demo",
    };
  } catch {
    return { results: mockLiteratureSearch(query), mode: "demo" };
  }
}
