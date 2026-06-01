import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { scanWithDetector } from "./ai-detectors/registry";
import type {
  AIDetectionScanResult,
  AIDetectorId,
  AISentenceResult,
  AIRiskLevel,
} from "./ai-detectors/types";

export type {
  AIDetectionScanResult,
  AIDetectorId,
  AISentenceResult,
  AIRiskLevel,
};

export async function scanTextForAI(
  text: string,
  detector: AIDetectorId = config.aiDetection.defaultProvider
): Promise<AIDetectionScanResult> {
  return scanWithDetector(text, detector);
}

async function humanizeWithOpenAI(
  flaggedBlock: string,
  count: number
): Promise<string[]> {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: process.env.VERCEL ? 30_000 : 60_000,
  });
  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: 2500,
    temperature: 0.75,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Rewrite academic sentences to sound human-written. JSON only.",
      },
      {
        role: "user",
        content: `Return {"rewrites":["..."]} with exactly ${count} rewrites in order:\n${flaggedBlock}`,
      },
    ],
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response");
  const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "")) as {
    rewrites?: string[];
  };
  return parsed.rewrites ?? [];
}

export async function humanizeFlaggedSentences(
  fullText: string,
  flagged: AISentenceResult[]
): Promise<{ text: string; mode: "demo" | "live" }> {
  if (flagged.length === 0) {
    return { text: fullText, mode: getRuntimeMode() };
  }

  const flaggedBlock = flagged.map((s) => `- ${s.text}`).join("\n");
  const useLive =
    getRuntimeMode() === "live" &&
    (config.openai.enabled() || config.gemini.enabled() || config.xai.enabled());

  const simpleRewrite = () => {
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
    return text;
  };

  if (!useLive) {
    return { text: simpleRewrite(), mode: "demo" };
  }

  if (config.openai.enabled()) {
    try {
      const rewrites = await humanizeWithOpenAI(flaggedBlock, flagged.length);
      let text = fullText;
      flagged.forEach((s, i) => {
        if (rewrites[i]) text = text.replace(s.text, rewrites[i]);
      });
      return { text, mode: "live" };
    } catch (e) {
      console.error("[ai-detection] humanize openai failed:", e);
    }
  }

  return { text: simpleRewrite(), mode: "live" };
}
