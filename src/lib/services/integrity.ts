import { getRuntimeMode } from "@/lib/config";
import { mockPlagiarismScore } from "@/lib/mock-ai";

export async function checkPlagiarism(text: string) {
  const mode = getRuntimeMode();

  if (mode === "demo") {
    return { ...mockPlagiarismScore(), mode: "demo" as const };
  }

  // Production: integrate Copyleaks, Turnitin API, or custom index
  // Heuristic demo-enhanced: use AI to flag likely paraphrase patterns when live
  const base = mockPlagiarismScore();
  return { ...base, mode: "demo" as const, note: "Connect plagiarism API in production" };
}

/** @deprecated Use scanTextForAI from ./ai-detection */
export async function detectAIContent(text: string) {
  const { scanTextForAI } = await import("./ai-detection");
  const result = await scanTextForAI(text);
  return {
    overallAI: result.overallAI,
    integrityScore: result.integrityScore,
    sentences: result.sentences.map((s) => ({
      text: s.text,
      aiProbability: s.aiProbability,
    })),
    mode: result.mode,
  };
}
