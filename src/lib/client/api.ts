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
  try {
    data = await res.json();
  } catch {
    throw new ApiError("Server error — please try again", res.status || 500);
  }
  if (!res.ok) {
    const msg =
      data.error ||
      (res.status === 401
        ? "Please sign in to use AI writing"
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

export type AIDetectionResult = {
  overallAI: number;
  sentences: { text: string; aiProbability: number }[];
  integrityScore: number;
  mode?: ApiMode;
};

export async function checkPlagiarismApi(text: string) {
  const res = await fetchWithTimeout("/api/plagiarism/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return parseJson<PlagiarismResult>(res);
}

export async function detectAIApi(text: string) {
  const res = await fetchWithTimeout("/api/ai-detection/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return parseJson<AIDetectionResult>(res);
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
