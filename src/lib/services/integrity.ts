import { config, getRuntimeMode } from "@/lib/config";
import { mockPlagiarismScore } from "@/lib/mock-ai";
import { checkPlagiarismWithCopyleaks } from "@/lib/services/copyleaks";

export async function checkPlagiarism(text: string) {
  if (config.copyleaks.enabled()) {
    try {
      return await checkPlagiarismWithCopyleaks(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Copyleaks scan failed";
      console.error("[plagiarism]", message);
      if (getRuntimeMode() === "demo") {
        return {
          ...mockPlagiarismScore(),
          mode: "demo" as const,
          note: message,
        };
      }
      throw err;
    }
  }

  if (getRuntimeMode() === "demo") {
    return { ...mockPlagiarismScore(), mode: "demo" as const };
  }

  return {
    ...mockPlagiarismScore(),
    mode: "demo" as const,
    note: "Add COPYLEAKS_EMAIL and COPYLEAKS_API_KEY in Vercel to enable live plagiarism scans.",
  };
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
