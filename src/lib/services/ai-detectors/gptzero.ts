import { config } from "@/lib/config";
import type { AIDetectionScanResult } from "./types";
import { buildScanResult, splitSentences, toPercentProbability } from "./shared";

type GptZeroSentence = {
  sentence?: string;
  generated_prob?: number;
  highlight_sentence_for_ai?: boolean;
};

type GptZeroDocument = {
  average_generated_prob?: number;
  completely_generated_prob?: number;
  sentences?: GptZeroSentence[];
};

export async function scanWithGptZero(text: string): Promise<AIDetectionScanResult> {
  const key = config.aiDetection.gptzero.apiKey;
  if (!key) throw new Error("GPTZERO_API_KEY is not configured");

  const res = await fetch("https://api.gptzero.me/v2/predict/text", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify({ document: text }),
    signal: AbortSignal.timeout(process.env.VERCEL ? 25_000 : 60_000),
  });

  if (res.status === 429) {
    throw new Error("GPTZero rate limit — try again in a minute");
  }
  if (res.status === 402) {
    throw new Error("GPTZero quota exceeded — check your plan at gptzero.me");
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`GPTZero API error (${res.status})${errText ? `: ${errText.slice(0, 120)}` : ""}`);
  }

  const data = (await res.json()) as { documents?: GptZeroDocument[] };
  const doc = data.documents?.[0];

  if (!doc) {
    throw new Error("GPTZero returned no document analysis");
  }

  const gzSentences = doc.sentences ?? [];
  let sentences: Array<{ text: string; aiProbability: number }>;

  if (gzSentences.length > 0) {
    sentences = gzSentences
      .filter((s) => (s.sentence?.trim().length ?? 0) > 10)
      .map((s) => ({
        text: s.sentence!.trim(),
        aiProbability: toPercentProbability(s.generated_prob ?? 0),
      }));
  } else {
    const parts = splitSentences(text).slice(0, 60);
    const overall = toPercentProbability(
      doc.average_generated_prob ?? doc.completely_generated_prob ?? 0
    );
    sentences = parts.map((s) => ({ text: s, aiProbability: overall }));
  }

  const overallAI =
    doc.average_generated_prob != null
      ? toPercentProbability(doc.average_generated_prob)
      : sentences.length > 0
        ? Math.round(
            sentences.reduce((a, b) => a + b.aiProbability, 0) / sentences.length
          )
        : 0;

  const result = buildScanResult(text, sentences, {
    mode: "live",
    detectorId: "gptzero",
    detectorLabel: "GPTZero",
  });

  if (overallAI > 0 && Math.abs(result.overallAI - overallAI) > 5) {
    return {
      ...result,
      overallAI,
      integrityScore: Math.max(0, 100 - overallAI),
    };
  }

  return result;
}
