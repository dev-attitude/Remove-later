import type {
  AIDetectionScanResult,
  AIRiskLevel,
  AIDetectorId,
  SentenceScore,
} from "./types";

export const AI_PHRASE_PATTERNS = [
  /\bfurthermore\b/i,
  /\bmoreover\b/i,
  /\bin conclusion\b/i,
  /\bit is important to note\b/i,
  /\bit is worth noting\b/i,
  /\bin today's (?:world|society|digital age)\b/i,
  /\bplays a (?:crucial|vital|significant) role\b/i,
  /\ba wide range of\b/i,
  /\bcomprehensive (?:overview|analysis)\b/i,
  /\bdelve\b/i,
  /\brobust\b/i,
  /\bleverage\b/i,
  /\butilize\b/i,
  /\bholistic\b/i,
  /\bparadigm\b/i,
  /\bmyriad\b/i,
];

export function riskFromProbability(p: number): AIRiskLevel {
  if (p >= 70) return "high";
  if (p >= 40) return "moderate";
  return "low";
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

export function heuristicScore(sentence: string, index: number): number {
  let score = 18 + (index % 7) * 3;
  for (const pattern of AI_PHRASE_PATTERNS) {
    if (pattern.test(sentence)) score += 12;
  }
  if (sentence.length > 120 && sentence.split(",").length > 3) score += 8;
  if (/^The (?:findings|results|study|research|analysis)/i.test(sentence)) score += 6;
  return Math.min(96, Math.max(5, score));
}

export function buildScanResult(
  fullText: string,
  sentences: SentenceScore[],
  opts: {
    mode: "demo" | "live";
    detectorId: AIDetectorId;
    detectorLabel: string;
    analysisNote?: string;
  }
): AIDetectionScanResult {
  const enriched = sentences.map((s, index) => ({
    ...s,
    index,
    risk: riskFromProbability(s.aiProbability),
  }));

  const counts = {
    high: enriched.filter((s) => s.risk === "high").length,
    moderate: enriched.filter((s) => s.risk === "moderate").length,
    low: enriched.filter((s) => s.risk === "low").length,
  };

  const overallAI =
    enriched.length > 0
      ? Math.round(
          enriched.reduce((a, b) => a + b.aiProbability, 0) / enriched.length
        )
      : 0;

  return {
    overallAI,
    integrityScore: Math.max(0, 100 - overallAI),
    sentences: enriched,
    fullText,
    mode: opts.mode,
    counts,
    analysisNote: opts.analysisNote,
    detectorId: opts.detectorId,
    detectorLabel: opts.detectorLabel,
  };
}

export function heuristicScan(
  text: string,
  mode: "demo" | "live",
  analysisNote?: string
): AIDetectionScanResult {
  const parts = splitSentences(text).slice(0, 60);
  const sentences = parts.map((s, i) => ({
    text: s,
    aiProbability: heuristicScore(s, i),
  }));
  return buildScanResult(text, sentences, {
    mode,
    detectorId: "heuristic",
    detectorLabel: "Heuristic (phrase patterns)",
    analysisNote,
  });
}

/** Normalize API probability that may be 0–1 or 0–100 */
export function toPercentProbability(value: number): number {
  if (value <= 1 && value >= 0) return Math.round(value * 100);
  return Math.min(100, Math.max(0, Math.round(value)));
}
