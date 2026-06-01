import { config, getRuntimeMode } from "@/lib/config";
import type { AIDetectionScanResult, AIDetectorId, AIDetectorInfo } from "./types";
import { heuristicScan } from "./shared";
import { scanWithGptZero } from "./gptzero";
import { scanWithLlm, type LlmDetectorBackend } from "./llm-sentence";

const AUTO_ORDER: AIDetectorId[] = ["gptzero", "openai", "gemini", "grok", "heuristic"];

const DETECTOR_META: Omit<AIDetectorInfo, "available">[] = [
  {
    id: "auto",
    label: "Auto (best available)",
    description: "Uses GPTZero if configured, then OpenAI, Gemini, Grok, or heuristics.",
    category: "local",
  },
  {
    id: "gptzero",
    label: "GPTZero",
    description: "Dedicated AI detector API with sentence-level scores (gptzero.me).",
    category: "dedicated",
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "LLM sentence scoring via your OpenAI model.",
    category: "llm",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    description: "LLM sentence scoring via Gemini.",
    category: "llm",
  },
  {
    id: "grok",
    label: "xAI Grok",
    description: "LLM sentence scoring via Grok.",
    category: "llm",
  },
  {
    id: "heuristic",
    label: "Heuristic only",
    description: "Phrase-pattern analysis — no API key required.",
    category: "local",
  },
];

export function isDetectorConfigured(id: AIDetectorId): boolean {
  switch (id) {
    case "auto":
    case "heuristic":
      return true;
    case "gptzero":
      return config.aiDetection.gptzero.enabled();
    case "openai":
      return config.openai.enabled();
    case "gemini":
      return config.gemini.enabled();
    case "grok":
      return config.xai.enabled();
    default:
      return false;
  }
}

export function listAIDetectors(): AIDetectorInfo[] {
  return DETECTOR_META.map((d) => ({
    ...d,
    available: d.id === "auto" ? true : isDetectorConfigured(d.id),
  }));
}

function resolveAutoDetector(): AIDetectorId {
  const preferred = config.aiDetection.defaultProvider;
  if (preferred !== "auto" && isDetectorConfigured(preferred)) {
    return preferred;
  }
  for (const id of AUTO_ORDER) {
    if (isDetectorConfigured(id)) return id;
  }
  return "heuristic";
}

async function runDetector(
  text: string,
  id: AIDetectorId
): Promise<AIDetectionScanResult> {
  switch (id) {
    case "gptzero":
      return scanWithGptZero(text);
    case "openai":
      return scanWithLlm(text, "openai");
    case "gemini":
      return scanWithLlm(text, "gemini");
    case "grok":
      return scanWithLlm(text, "grok");
    case "heuristic":
      return heuristicScan(
        text,
        getRuntimeMode() === "live" ? "live" : "demo",
        id === "heuristic" ? undefined : undefined
      );
    default:
      throw new Error(`Unknown detector: ${id}`);
  }
}

function fallbackNote(failed: string, next: string): string {
  return `${failed} failed — results from ${next}.`;
}

export async function scanWithDetector(
  text: string,
  requested: AIDetectorId = "auto"
): Promise<AIDetectionScanResult> {
  const trimmed = text.trim();
  if (trimmed.length < 10) {
    throw new Error("Text is too short to scan.");
  }

  let detectorId = requested === "auto" ? resolveAutoDetector() : requested;

  if (detectorId !== "heuristic" && !isDetectorConfigured(detectorId)) {
    if (requested !== "auto") {
      throw new Error(
        `${DETECTOR_META.find((d) => d.id === detectorId)?.label ?? detectorId} is not configured. Add the API key in environment variables.`
      );
    }
    detectorId = "heuristic";
  }

  const runtime = getRuntimeMode();
  const canRunLive =
    detectorId === "gptzero" ||
    detectorId === "heuristic" ||
    (runtime === "live" && isDetectorConfigured(detectorId));

  if (!canRunLive && detectorId !== "heuristic") {
    if (isDetectorConfigured(detectorId)) {
      return heuristicScan(
        trimmed,
        "live",
        `Set GM_APP_MODE=production for full ${DETECTOR_META.find((d) => d.id === detectorId)?.label ?? detectorId} scans.`
      );
    }
    return heuristicScan(
      trimmed,
      "demo",
      "Demo mode — configure GPTZERO_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or XAI_API_KEY."
    );
  }

  if (detectorId === "heuristic") {
    return heuristicScan(
      trimmed,
      runtime === "live" || config.openai.enabled() ? "live" : "demo",
      requested === "heuristic"
        ? "Phrase-pattern analysis only — not a trained AI detector."
        : undefined
    );
  }

  try {
    return await runDetector(trimmed, detectorId);
  } catch (e) {
    console.error(`[ai-detection] ${detectorId} failed:`, e);
    const failLabel =
      DETECTOR_META.find((d) => d.id === detectorId)?.label ?? detectorId;
    const errMsg = e instanceof Error ? e.message : "Scan failed";

    if (requested !== "auto") {
      const fallbackId = resolveAutoDetector();
      if (fallbackId !== detectorId && fallbackId !== "heuristic") {
        try {
          const result = await runDetector(trimmed, fallbackId);
          return {
            ...result,
            analysisNote: fallbackNote(failLabel, result.detectorLabel) + ` (${errMsg})`,
          };
        } catch {
          /* continue to heuristic */
        }
      }
      return heuristicScan(trimmed, "live", `${failLabel}: ${errMsg}`);
    }

    const nextId = AUTO_ORDER.find(
      (id) => id !== detectorId && isDetectorConfigured(id) && id !== "heuristic"
    );
    if (nextId) {
      try {
        const result = await runDetector(trimmed, nextId);
        return {
          ...result,
          analysisNote: fallbackNote(failLabel, result.detectorLabel),
        };
      } catch {
        /* heuristic below */
      }
    }

    return heuristicScan(
      trimmed,
      config.openai.enabled() || config.aiDetection.gptzero.enabled() ? "live" : "demo",
      fallbackNote(failLabel, "heuristic phrase analysis")
    );
  }
}

export type { LlmDetectorBackend };
