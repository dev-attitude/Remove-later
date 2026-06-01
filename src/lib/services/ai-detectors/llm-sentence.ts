import OpenAI from "openai";
import { config } from "@/lib/config";
import type { AIDetectionScanResult } from "./types";
import {
  buildScanResult,
  heuristicScore,
  splitSentences,
} from "./shared";

export type LlmDetectorBackend = "openai" | "gemini" | "grok";

const LABELS: Record<LlmDetectorBackend, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  grok: "xAI Grok",
};

async function scoreWithOpenAICompatible(
  sampleBlock: string,
  sample: string[],
  backend: LlmDetectorBackend
): Promise<Array<{ text: string; aiProbability: number }>> {
  const system =
    "You detect AI-written academic text. Output valid JSON only. Score each sentence 0-100 for AI likelihood.";
  const user = `Return JSON: {"sentences":[{"index":0,"aiProbability":75},...]}
Score every numbered sentence. Be strict on generic AI phrasing.

${sampleBlock}`;

  let raw: string | undefined;

  if (backend === "openai") {
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: process.env.VERCEL ? 25_000 : 60_000,
    });
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    raw = completion.choices[0]?.message?.content?.trim();
  } else if (backend === "grok") {
    const client = new OpenAI({
      apiKey: config.xai.apiKey,
      baseURL: "https://api.x.ai/v1",
      timeout: process.env.VERCEL ? 25_000 : 60_000,
    });
    const completion = await client.chat.completions.create({
      model: config.xai.model,
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    raw = completion.choices[0]?.message?.content?.trim();
  } else {
    const key = config.gemini.apiKey!;
    const model = config.gemini.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          responseMimeType: "application/json",
        },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  }

  if (!raw) throw new Error("Empty model response");

  const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "")) as {
    sentences?: Array<{ index?: number; aiProbability?: number }>;
  };

  return sample.map((s, i) => {
    const match = parsed.sentences?.find((x) => x.index === i);
    const prob =
      typeof match?.aiProbability === "number"
        ? Math.min(100, Math.max(0, Math.round(match.aiProbability)))
        : heuristicScore(s, i);
    return { text: s, aiProbability: prob };
  });
}

export async function scanWithLlm(
  text: string,
  backend: LlmDetectorBackend
): Promise<AIDetectionScanResult> {
  const sample = splitSentences(text).slice(0, 40);
  const sampleBlock = sample.map((s, i) => `[${i}] ${s}`).join("\n");
  const sentences = await scoreWithOpenAICompatible(sampleBlock, sample, backend);

  return buildScanResult(text, sentences, {
    mode: "live",
    detectorId: backend,
    detectorLabel: LABELS[backend],
  });
}
