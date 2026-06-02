import type { UnifiedPaper } from "./types";

type CoreWork = {
  id: string;
  title?: string;
  abstract?: string;
  authors?: Array<{ name?: string }>;
  yearPublished?: number;
  doi?: string;
  downloadUrl?: string;
};

export async function searchCore(query: string, limit = 5): Promise<UnifiedPaper[]> {
  const key = process.env.CORE_API_KEY?.trim();
  const headers: HeadersInit = { Accept: "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;

  const url = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`CORE API ${res.status}`);
  }

  const data = (await res.json()) as { results?: CoreWork[] };
  const results = data.results ?? [];

  return results.map((work, i) => {
    const authors =
      work.authors
        ?.map((a) => a.name)
        .filter(Boolean)
        .join(", ") || "Unknown authors";
    return {
      id: work.id || `core-${i}`,
      title: work.title || "Untitled",
      authors,
      year: work.yearPublished ?? new Date().getFullYear(),
      source: "CORE",
      sourceId: "core",
      abstract: work.abstract,
      doi: work.doi,
      url: work.downloadUrl || (work.doi ? `https://doi.org/${work.doi}` : undefined),
      citations: 0,
    };
  });
}
