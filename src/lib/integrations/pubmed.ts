import type { UnifiedPaper } from "./types";

export async function searchPubMed(query: string, limit = 5): Promise<UnifiedPaper[]> {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;

  const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
  if (!searchRes.ok) return [];

  const searchData = (await searchRes.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const ids = searchData.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const summaryRes = await fetch(summaryUrl, { next: { revalidate: 3600 } });
  if (!summaryRes.ok) return [];

  const summary = (await summaryRes.json()) as {
    result?: Record<
      string,
      {
        title?: string;
        fulljournalname?: string;
        pubdate?: string;
        authors?: Array<{ name?: string }>;
        elocationid?: string;
      }
    >;
  };

  return ids.map((id) => {
    const item = summary.result?.[id];
    const year = item?.pubdate ? parseInt(item.pubdate.slice(0, 4), 10) : new Date().getFullYear();
    return {
      id: `pubmed-${id}`,
      title: item?.title ?? "Untitled",
      authors: item?.authors?.map((a) => a.name).join("; ") ?? "Unknown",
      year: Number.isNaN(year) ? new Date().getFullYear() : year,
      source: "PubMed",
      sourceId: "pubmed",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      citations: 0,
      gap: "Health sciences focus — verify study design",
    };
  });
}
