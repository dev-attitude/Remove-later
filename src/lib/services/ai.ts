import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { generateMockResponse } from "@/lib/mock-ai";

const SYSTEM_PROMPT = `You are GM Research Suite, an expert academic research assistant.
Write in formal academic English suitable for theses and journal articles.
Use clear structure with headings where appropriate. Be precise and evidence-oriented.
Never fabricate specific citations or DOIs — use placeholders like (Author, Year) when needed.`;

export async function generateAcademicText(
  prompt: string,
  options?: { context?: string; maxTokens?: number }
): Promise<{ content: string; mode: "demo" | "live" }> {
  const mode = getRuntimeMode();

  if (mode === "demo" || !config.openai.enabled()) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return { content: generateMockResponse(prompt), mode: "demo" };
  }

  const openai = new OpenAI({ apiKey: config.openai.apiKey });

  const userContent = options?.context
    ? `Context from uploaded documents:\n${options.context}\n\n---\n\nTask: ${prompt}`
    : prompt;

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: options?.maxTokens ?? 2000,
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const content =
    completion.choices[0]?.message?.content?.trim() ||
    "No response generated. Please try again.";

  return { content, mode: "live" };
}
