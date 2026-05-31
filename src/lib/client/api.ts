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
  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error || "Request failed", res.status);
  }
  return data as T;
}

export async function generateText(
  prompt: string,
  options?: { context?: string; portal?: string }
): Promise<{ content: string; mode: ApiMode }> {
  const res = await fetch("/api/ai/generate", {
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
  const res = await fetch("/api/plagiarism/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return parseJson<PlagiarismResult>(res);
}

export async function detectAIApi(text: string) {
  const res = await fetch("/api/ai-detection/scan", {
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

export async function searchLiteratureApi(query: string) {
  const res = await fetch("/api/literature/search", {
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

  const res = await fetch("/api/upload", { method: "POST", body: form });
  return parseJson<{
    id: string;
    name: string;
    mode: ApiMode;
  }>(res);
}

export async function createCheckout(portal: string, tierId: string) {
  const res = await fetch("/api/stripe/checkout", {
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
