import type { UnifiedPaper } from "./types";

export async function searchOpenAlex(
  query: string,
  limit = 5
): Promise<UnifiedPaper[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${limit}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    results?: Array<{
      id?: string;
      title?: string;
      publication_year?: number;
      cited_by_count?: number;
      doi?: string;
      authorships?: Array<{ author?: { display_name?: string } }>;
      abstract_inverted_index?: Record<string, number[]>;
    }>;
  };

  return (data.results ?? []).map((w) => {
    const authors =
      w.authorships
        ?.map((a) => a.author?.display_name)
        .filter(Boolean)
        .slice(0, 4)
        .join("; ") || "Unknown";

    return {
      id: w.id ?? crypto.randomUUID(),
      title: w.title ?? "Untitled",
      authors,
      year: w.publication_year ?? new Date().getFullYear(),
      source: "OpenAlex",
      sourceId: "openalex",
      doi: w.doi?.replace("https://doi.org/", ""),
      url: w.doi,
      citations: w.cited_by_count ?? 0,
      gap: "Review methodology and regional relevance for Namibia/Global South",
    };
  });
}
