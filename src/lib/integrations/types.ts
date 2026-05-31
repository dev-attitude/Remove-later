export type SourceCategory =
  | "ai"
  | "literature"
  | "data"
  | "institution"
  | "citation";

export type IntegrationSource = {
  id: string;
  name: string;
  category: SourceCategory;
  description: string;
  /** API wired in backend */
  apiEnabled: boolean;
  /** Needs env API key */
  requiresKey?: string;
  website: string;
  searchUrl?: (query: string) => string;
};

export type UnifiedPaper = {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  sourceId: string;
  abstract?: string;
  doi?: string;
  url?: string;
  citations: number;
  gap?: string;
};
