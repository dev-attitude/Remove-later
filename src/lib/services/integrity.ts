import { config, getRuntimeMode } from "@/lib/config";
import { mockAIDetection, mockPlagiarismScore } from "@/lib/mock-ai";
import { generateAcademicText } from "./ai";

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

export async function detectAIContent(text: string) {
  const mode = getRuntimeMode();

  if (mode === "demo" || !config.openai.enabled()) {
    return { ...mockAIDetection(text), mode: "demo" as const };
  }

  try {
    const { content } = await generateAcademicText(
      `Analyze the following text for AI-generated patterns. Return ONLY valid JSON with this shape:
{"overallAI": number 0-100, "integrityScore": number 0-100, "sentences": [{"text": string, "aiProbability": number}]}
Analyze up to 8 sentences from the input.

Text:
${text.slice(0, 4000)}`,
      { maxTokens: 1500 }
    );

    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) as {
      overallAI: number;
      integrityScore: number;
      sentences: { text: string; aiProbability: number }[];
    };

    return { ...parsed, mode: "live" as const };
  } catch {
    return { ...mockAIDetection(text), mode: "demo" as const };
  }
}
