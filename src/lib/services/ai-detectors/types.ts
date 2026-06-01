export type AIRiskLevel = "high" | "moderate" | "low";

export type AISentenceResult = {
  text: string;
  aiProbability: number;
  risk: AIRiskLevel;
  index: number;
};

export type AIDetectionScanResult = {
  overallAI: number;
  integrityScore: number;
  sentences: AISentenceResult[];
  fullText: string;
  mode: "demo" | "live";
  counts: { high: number; moderate: number; low: number };
  analysisNote?: string;
  detectorId: AIDetectorId;
  detectorLabel: string;
};

/** Built-in detector backends */
export type AIDetectorId =
  | "auto"
  | "openai"
  | "gemini"
  | "grok"
  | "gptzero"
  | "heuristic";

export type AIDetectorInfo = {
  id: AIDetectorId;
  label: string;
  description: string;
  available: boolean;
  category: "dedicated" | "llm" | "local";
};

export type SentenceScore = { text: string; aiProbability: number };
