/** Curated open knowledge ecosystems linked across the library */
export const OPEN_KNOWLEDGE_ECOSYSTEMS = {
  papers: [
    { id: "openalex", name: "OpenAlex" },
    { id: "semantic-scholar", name: "Semantic Scholar" },
    { id: "core", name: "CORE" },
    { id: "pubmed", name: "PubMed" },
    { id: "arxiv", name: "arXiv" },
    { id: "crossref", name: "Crossref" },
  ],
  books: [
    { id: "open-textbook-library", name: "Open Textbook Library" },
    { id: "bccampus", name: "BCcampus Open Education" },
    { id: "gutenberg", name: "Project Gutenberg" },
    { id: "internet-archive", name: "Internet Archive" },
  ],
  statistics: [
    { id: "worldbank", name: "World Bank Data" },
    { id: "un-data", name: "United Nations Data" },
    { id: "oecd", name: "OECD Data" },
    { id: "who", name: "WHO Data" },
  ],
} as const;

/** Level 1 recommended open resources */
export const FOUNDATION_OPEN_RESOURCES = [
  {
    name: "Open Textbook Library",
    sourceId: "open-textbook-library",
    note: "Research methods & academic writing textbooks",
  },
  {
    name: "BCcampus Open Education",
    sourceId: "bccampus",
    note: "OER for research skills and discipline introductions",
  },
] as const;
