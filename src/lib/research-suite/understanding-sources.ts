import { INTEGRATION_SOURCES } from "@/lib/integrations/registry";

/** Live APIs queried when a topic is selected */
export const UNDERSTANDING_API_SOURCE_IDS = [
  "openalex",
  "semantic-scholar",
  "pubmed",
  "arxiv",
  "core",
] as const;

/** External databases & tools — open search in a new tab */
export const UNDERSTANDING_EXTERNAL_SOURCE_IDS = [
  "openalex",
  "semantic-scholar",
  "core",
  "pubmed",
  "arxiv",
  "google-scholar",
  "crossref",
  "open-textbook-library",
  "gutenberg",
  "internet-archive",
  "zotero",
  "mendeley",
  "spss",
  "jasp",
  "jamovi",
  "r-project",
] as const;

export function buildUnderstandingSearchQuery(topicLabel: string): string {
  return `${topicLabel} research methods academic`;
}

export function getUnderstandingExternalSources() {
  const ids = new Set<string>(UNDERSTANDING_EXTERNAL_SOURCE_IDS);
  return INTEGRATION_SOURCES.filter((s) => ids.has(s.id) && (s.searchUrl || s.website));
}

export function openUnderstandingSourceSearch(sourceId: string, query: string) {
  const src = INTEGRATION_SOURCES.find((s) => s.id === sourceId);
  if (src?.searchUrl) {
    window.open(src.searchUrl(query), "_blank", "noopener,noreferrer");
    return;
  }
  if (src?.website) window.open(src.website, "_blank", "noopener,noreferrer");
}
