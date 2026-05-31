import { config, getRuntimeMode } from "@/lib/config";
import { generateAcademicText } from "./ai";

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
};

const AI_PHRASE_PATTERNS = [
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

function riskFromProbability(p: number): AIRiskLevel {
  if (p >= 70) return "high";
  if (p >= 40) return "moderate";
  return "low";
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function heuristicScore(sentence: string, index: number): number {
  let score = 18 + (index % 7) * 3;
  for (const pattern of AI_PHRASE_PATTERNS) {
    if (pattern.test(sentence)) score += 12;
  }
  if (sentence.length > 120 && sentence.split(",").length > 3) score += 8;
  if (/^The (?:findings|results|study|research|analysis)/i.test(sentence)) score += 6;
  return Math.min(96, Math.max(5, score));
}

function buildResult(
  fullText: string,
  sentences: Array<{ text: string; aiProbability: number }>,
  mode: "demo" | "live"
): AIDetectionScanResult {
  const enriched: AISentenceResult[] = sentences.map((s, index) => ({
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
    mode,
    counts,
  };
}

function mockScan(text: string): AIDetectionScanResult {
  const parts = splitSentences(text).slice(0, 60);
  const sentences = parts.map((s, i) => ({
    text: s,
    aiProbability: heuristicScore(s, i),
  }));
  return buildResult(text, sentences, "demo");
}

async function liveScan(text: string): Promise<AIDetectionScanResult> {
  const sample = splitSentences(text).slice(0, 40);
  const sampleBlock = sample.map((s, i) => `[${i}] ${s}`).join("\n");

  const { content } = await generateAcademicText(
    `You are an academic integrity AI detector. Score each numbered sentence for likelihood it was AI-generated (0-100).

Return ONLY valid JSON:
{"sentences":[{"index":number,"aiProbability":number}]}

Use index matching the bracket numbers. Be strict on generic academic filler and robotic phrasing.

Sentences:
${sampleBlock}`,
    { maxTokens: 2000 }
  );

  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) as {
      sentences?: Array<{ index?: number; aiProbability?: number }>;
    };
    const sentences = sample.map((s, i) => {
      const match = parsed.sentences?.find((x) => x.index === i);
      const prob =
        typeof match?.aiProbability === "number"
          ? Math.min(100, Math.max(0, Math.round(match.aiProbability)))
          : heuristicScore(s, i);
      return { text: s, aiProbability: prob };
    });
    return buildResult(text, sentences, "live");
  } catch {
    return mockScan(text);
  }
}

export async function scanTextForAI(text: string): Promise<AIDetectionScanResult> {
  const trimmed = text.trim();
  if (trimmed.length < 10) {
    throw new Error("Text is too short to scan.");
  }

  const mode = getRuntimeMode();
  if (mode === "live" && config.openai.enabled()) {
    try {
      return await liveScan(trimmed);
    } catch (e) {
      console.error("[ai-detection] live scan failed:", e);
      return mockScan(trimmed);
    }
  }
  return mockScan(trimmed);
}

export async function humanizeFlaggedSentences(
  fullText: string,
  flagged: AISentenceResult[]
): Promise<{ text: string; mode: "demo" | "live" }> {
  if (flagged.length === 0) {
    return { text: fullText, mode: "demo" };
  }

  const flaggedBlock = flagged.map((s) => `- ${s.text}`).join("\n");

  const prompt = `Rewrite ONLY the following sentences so they sound naturally human-written by a university student. Keep the same meaning. Use varied sentence length. Avoid clichéd AI phrases. Return ONLY valid JSON:
{"rewrites":["sentence1","sentence2",...]}

There are exactly ${flagged.length} sentences to rewrite, in order:

${flaggedBlock}`;

  const mode = getRuntimeMode();
  if (mode !== "live" || !config.openai.enabled()) {
    const rewrites = flagged.map((s) =>
      s.text
        .replace(/\bFurthermore\b/gi, "Also")
        .replace(/\bMoreover\b/gi, "In addition")
        .replace(/\butilize\b/gi, "use")
        .replace(/\bleverage\b/gi, "use")
    );
    let text = fullText;
    flagged.forEach((s, i) => {
      text = text.replace(s.text, rewrites[i] ?? s.text);
    });
    return { text, mode: "demo" };
  }

  try {
    const { content } = await generateAcademicText(prompt, { maxTokens: 2500 });
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) as {
      rewrites?: string[];
    };
    const rewrites = parsed.rewrites ?? [];
    let text = fullText;
    flagged.forEach((s, i) => {
      if (rewrites[i]) text = text.replace(s.text, rewrites[i]);
    });
    return { text, mode: "live" };
  } catch (e) {
    console.error("[ai-detection] humanize failed:", e);
    const rewrites = flagged.map((s) =>
      s.text
        .replace(/\bFurthermore\b/gi, "Also")
        .replace(/\bMoreover\b/gi, "In addition")
        .replace(/\butilize\b/gi, "use")
    );
    let text = fullText;
    flagged.forEach((s, i) => {
      text = text.replace(s.text, rewrites[i] ?? s.text);
    });
    return { text, mode: "demo" };
  }
}
