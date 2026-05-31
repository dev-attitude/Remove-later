import { config } from "@/lib/config";
import { searchSemanticScholar } from "./semantic-scholar";
import { searchOpenAlex } from "./openalex";
import { searchPubMed } from "./pubmed";
import { searchArxiv } from "./arxiv";
import { searchWorldBank } from "./worldbank";
import type { UnifiedPaper } from "./types";
import type { WorldBankIndicator } from "./worldbank";

export type MultiSearchResult = {
  papers: UnifiedPaper[];
  datasets: WorldBankIndicator[];
  sourcesQueried: string[];
  errors: string[];
};

export async function multiSourceSearch(
  query: string,
  sourceIds: string[]
): Promise<MultiSearchResult> {
  const papers: UnifiedPaper[] = [];
  const datasets: WorldBankIndicator[] = [];
  const sourcesQueried: string[] = [];
  const errors: string[] = [];

  const tasks: Promise<void>[] = [];

  if (sourceIds.includes("semantic-scholar")) {
    tasks.push(
      (async () => {
        try {
          const r = await searchSemanticScholar(query, 5, config.semanticScholar.apiKey);
          papers.push(...r);
          sourcesQueried.push("Semantic Scholar");
        } catch {
          errors.push("Semantic Scholar unavailable");
        }
      })()
    );
  }

  if (sourceIds.includes("openalex")) {
    tasks.push(
      (async () => {
        try {
          const r = await searchOpenAlex(query, 5);
          papers.push(...r);
          sourcesQueried.push("OpenAlex");
        } catch {
          errors.push("OpenAlex unavailable");
        }
      })()
    );
  }

  if (sourceIds.includes("pubmed")) {
    tasks.push(
      (async () => {
        try {
          const r = await searchPubMed(query, 5);
          papers.push(...r);
          sourcesQueried.push("PubMed");
        } catch {
          errors.push("PubMed unavailable");
        }
      })()
    );
  }

  if (sourceIds.includes("arxiv")) {
    tasks.push(
      (async () => {
        try {
          const r = await searchArxiv(query, 5);
          papers.push(...r);
          sourcesQueried.push("arXiv");
        } catch {
          errors.push("arXiv unavailable");
        }
      })()
    );
  }

  if (sourceIds.includes("worldbank")) {
    tasks.push(
      (async () => {
        try {
          const r = await searchWorldBank(query, 5);
          datasets.push(...r);
          sourcesQueried.push("World Bank");
        } catch {
          errors.push("World Bank unavailable");
        }
      })()
    );
  }

  await Promise.all(tasks);

  const seen = new Set<string>();
  const uniquePapers = papers.filter((p) => {
    const key = `${p.title.toLowerCase().slice(0, 60)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    papers: uniquePapers.sort((a, b) => b.citations - a.citations),
    datasets,
    sourcesQueried,
    errors,
  };
}
