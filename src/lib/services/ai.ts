import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { generateMockResponse } from "@/lib/mock-ai";

const SYSTEM_PROMPT = `You are Skyrapay Research Suite, an expert academic research assistant.
Write in formal academic English suitable for theses and journal articles.
Use clear structure with headings where appropriate. Be precise and evidence-oriented.
Never fabricate specific citations or DOIs — use placeholders like (Author, Year) when needed.`;

/** Vercel Hobby plan limits functions to ~10s — keep responses fast */
const OPENAI_TIMEOUT_MS = process.env.VERCEL ? 8_000 : 45_000;
const DEFAULT_MAX_TOKENS = process.env.VERCEL ? 900 : 2000;

async function callOpenAI(
  prompt: string,
  options?: { context?: string; maxTokens?: number }
): Promise<string> {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: OPENAI_TIMEOUT_MS,
    maxRetries: 1,
  });

  const userContent = options?.context
    ? `Context from uploaded documents:\n${options.context}\n\n---\n\nTask: ${prompt}`
    : prompt;

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "No response generated. Please try again."
  );
}

export async function generateAcademicText(
  prompt: string,
  options?: { context?: string; maxTokens?: number }
): Promise<{ content: string; mode: "demo" | "live" }> {
  if (!config.openai.enabled()) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return { content: generateMockResponse(prompt), mode: "demo" };
  }

  try {
    const content = await callOpenAI(prompt, options);
    return { content, mode: "live" };
  } catch (error) {
    console.error("[ai] OpenAI failed, using fallback:", error);
    const fallback = generateMockResponse(prompt);
    const note =
      "\n\n---\n*Note: Live AI timed out or failed. Showing backup content. Sign in, retry, or check OpenAI billing on Vercel.*";
    return {
      content: fallback + note,
      mode: "demo",
    };
  }
}
