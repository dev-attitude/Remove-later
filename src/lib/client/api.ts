"use client";

export type ApiMode = "demo" | "live";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  let data: { error?: string };
  const raw = await res.text();
  try {
    data = raw ? (JSON.parse(raw) as { error?: string }) : {};
  } catch {
    const hint =
      res.status >= 500
        ? "The server could not process this file. Try a smaller PDF/DOCX or paste your text instead."
        : "Unexpected server response. Please try again or paste your text.";
    throw new ApiError(hint, res.status || 500);
  }
  if (!res.ok) {
    const msg =
      data.error ||
      (res.status === 401
        ? "Please sign in to use AI writing"
        : res.status === 402
          ? "Your 3-day free trial has ended. Please subscribe to continue."
        : res.status === 504
          ? "Request timed out — try again"
          : "Request failed");
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = 90_000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}

export type SourceUsed = {
  title: string;
  authors: string;
  year: number;
  source: string;
  doi?: string;
  url?: string;
};

export type AcademicWritingResult = {
  content: string;
  mode: ApiMode;
  targetLabel: string;
  researchLevelLabel: string;
  sourcesUsed: SourceUsed[];
  sourcesQueried: string[];
  notice?: string;
};

export async function generateAcademicWritingApi(input: {
  topic: string;
  researchLevel: string;
  target?: string;
  portal?: string;
  tool?: string;
  draft?: string;
}) {
  const res = await fetchWithTimeout(
    "/api/ai/writing",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    120_000
  );
  return parseJson<AcademicWritingResult>(res);
}

export async function generateText(
  prompt: string,
  options?: { context?: string; portal?: string }
): Promise<{ content: string; mode: ApiMode }> {
  const res = await fetchWithTimeout("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ...options }),
  });
  return parseJson(res);
}

export type PlagiarismResult = {
  similarity: number;
  matches: { text: string; source: string; percent: number }[];
  mode?: ApiMode;
};

export type AIRiskLevel = "high" | "moderate" | "low";

export type AIDetectorId =
  | "auto"
  | "openai"
  | "gemini"
  | "grok"
  | "gptzero"
  | "heuristic";

export type AIDetectorProviderInfo = {
  id: AIDetectorId;
  label: string;
  description: string;
  available: boolean;
  category: "dedicated" | "llm" | "local";
};

export type AIDetectionResult = {
  overallAI: number;
  sentences: {
    text: string;
    aiProbability: number;
    risk: AIRiskLevel;
    index: number;
  }[];
  integrityScore: number;
  fullText: string;
  mode?: ApiMode;
  counts: { high: number; moderate: number; low: number };
  analysisNote?: string;
  detectorId?: AIDetectorId;
  detectorLabel?: string;
};

export async function fetchAIDetectorProviders() {
  const res = await fetchWithTimeout("/api/ai-detection/providers", {}, 15_000);
  return parseJson<{
    providers: AIDetectorProviderInfo[];
    defaultProvider: AIDetectorId;
  }>(res);
}

export async function extractDocumentTextApi(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithTimeout(
    "/api/ai-detection/extract",
    {
      method: "POST",
      body: form,
    },
    120_000
  );
  return parseJson<{ text: string; fileName: string; charCount: number }>(res);
}

export async function checkPlagiarismApi(text: string) {
  const res = await fetchWithTimeout("/api/plagiarism/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return parseJson<PlagiarismResult>(res);
}

export async function detectAIApi(text: string, detector?: AIDetectorId) {
  const res = await fetchWithTimeout(
    "/api/ai-detection/scan",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, detector }),
    },
    120_000
  );
  return parseJson<AIDetectionResult>(res);
}

export async function humanizeFlaggedAIApi(
  fullText: string,
  flagged: AIDetectionResult["sentences"]
) {
  const res = await fetchWithTimeout(
    "/api/ai-detection/humanize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullText, flagged }),
    },
    120_000
  );
  return parseJson<{ text: string; mode: ApiMode }>(res);
}

export type LiteratureResult = {
  title: string;
  authors: string;
  year: number;
  source: string;
  citations: number;
  gap: string;
  paperId?: string;
};

export type GeneratedTopic = {
  id: string;
  title: string;
  rationale: string;
  researchQuestions: string[];
  alignmentNote: string;
};

export type TopicWithArticles = {
  topic: GeneratedTopic;
  articles: Array<{
    id: string;
    title: string;
    authors: string;
    year: number;
    source: string;
    citations: number;
    abstract?: string;
    doi?: string;
    url?: string;
  }>;
};

export type TopicGenerationResult = {
  topics: TopicWithArticles[];
  mode: ApiMode;
  researchLevel: string;
  researchLevelLabel: string;
};

export type GeneratedCurriculum = {
  summary: string;
  roadmap: Array<{
    title: string;
    duration: string;
    activities: string[];
    libraryLevels: number[];
  }>;
  recommendedBooks: Array<{ title: string; source: string; reason: string; url?: string }>;
  recommendedModules: Array<{ name: string; moduleId: string; reason: string }>;
  methodologies: string[];
  statisticsPath: string[];
  writingExercises: string[];
  recommendedPapers: Array<{
    title: string;
    authors: string;
    year: number;
    source: string;
    url?: string;
  }>;
  sourcesQueried: string[];
  mode: ApiMode;
};

export type UnderstandingResult = {
  content: string;
  mode: ApiMode;
  modeLabel: string;
  actionLabel: string;
  sourceLabel: string;
};

export type UnderstandingTopicContentResult = {
  module: string;
  topic: string;
  overview: string;
  mode: ApiMode;
  contentSource?: "ai" | "literature";
  aiProvider?: "openai" | "grok";
  papers: Array<{
    id: string;
    title: string;
    authors: string;
    year: number;
    source: string;
    sourceId?: string;
    abstract?: string;
    doi?: string;
    url?: string;
    citations: number;
  }>;
  sourcesQueried: string[];
  errors: string[];
  trialNotice?: string;
  booksUsed?: { id: string; title: string }[];
};

export type UnderstandingBookSummary = {
  id: string;
  title: string;
  fileName: string;
  moduleScope: string | null;
  charCount: number;
  createdAt: string;
};

export async function fetchUnderstandingBooksApi() {
  const res = await fetchWithTimeout("/api/research/understanding/books", {
    method: "GET",
  });
  return parseJson<{ books: UnderstandingBookSummary[]; canManage: boolean }>(res);
}

export async function uploadUnderstandingBookApi(
  file: File,
  options?: { title?: string; moduleScope?: string }
) {
  const form = new FormData();
  form.append("file", file);
  if (options?.title) form.append("title", options.title);
  if (options?.moduleScope) form.append("moduleScope", options.moduleScope);
  const res = await fetchWithTimeout(
    "/api/research/understanding/books",
    { method: "POST", body: form },
    120_000
  );
  return parseJson<{ book: UnderstandingBookSummary }>(res);
}

export async function deleteUnderstandingBookApi(id: string) {
  const res = await fetchWithTimeout(`/api/research/understanding/books/${id}`, {
    method: "DELETE",
  });
  return parseJson<{ ok: boolean }>(res);
}

export async function fetchUnderstandingTopicApi(input: {
  module: string;
  topic: string;
  portal?: string;
}) {
  const res = await fetchWithTimeout(
    "/api/research/understanding/topic",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    120_000
  );
  return parseJson<UnderstandingTopicContentResult>(res);
}

export async function analyzeUnderstandingApi(input: {
  mode: "topic" | "document";
  action: string;
  researchLevel: string;
  field?: string;
  topic?: string;
  documentText?: string;
  fileName?: string;
  portal?: string;
}) {
  const res = await fetchWithTimeout(
    "/api/research/understanding",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    120_000
  );
  return parseJson<UnderstandingResult>(res);
}

export async function generateCurriculumApi(input: {
  researchLevel: string;
  discipline: string;
  goals?: string;
  portal?: string;
}) {
  const res = await fetchWithTimeout(
    "/api/research/curriculum",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    120_000
  );
  return parseJson<GeneratedCurriculum>(res);
}

export async function generateResearchTopicsApi(input: {
  fieldOfStudy: string;
  problems: string;
  researchLocation: string;
  researchMethod: string;
  researchLevel: string;
  portal?: string;
}) {
  const res = await fetchWithTimeout(
    "/api/research/topics",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    120_000
  );
  return parseJson<TopicGenerationResult>(res);
}

export async function searchLiteratureApi(query: string) {
  const res = await fetchWithTimeout("/api/literature/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return parseJson<{ results: LiteratureResult[]; mode: ApiMode }>(res);
}

export async function uploadDocument(file: File, portal?: string) {
  const form = new FormData();
  form.append("file", file);
  if (portal) form.append("portal", portal);

  const res = await fetchWithTimeout("/api/upload", { method: "POST", body: form });
  return parseJson<{
    id: string;
    name: string;
    mode: ApiMode;
  }>(res);
}

export async function createCheckout(portal: string, tierId: string) {
  const res = await fetchWithTimeout("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portal, tierId }),
  });
  return parseJson<{ url: string | null; demo: boolean; message?: string }>(res);
}

export async function fetchSystemStatus() {
  const res = await fetch("/api/health");
  return parseJson<{
    status: string;
    appMode: string;
    runtimeMode: ApiMode;
    demoBanner: boolean;
    services: Record<string, boolean>;
  }>(res);
}
