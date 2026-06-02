import { config } from "@/lib/config";
import { generateMockResponse } from "@/lib/mock-ai";

export type AIProvider = "openai" | "gemini" | "grok" | "auto";

export async function generateWithProvider(
  prompt: string,
  provider: AIProvider = "auto"
): Promise<{ content: string; provider: string }> {
  const tryOpenAI = provider === "openai" || provider === "auto";
  const tryGemini = provider === "gemini";
  const tryGrok = provider === "grok" || provider === "auto";

  if (tryOpenAI && config.openai.enabled()) {
    try {
      const { generateAcademicText } = await import("./ai");
      const r = await generateAcademicText(prompt);
      return { content: r.content, provider: "openai" };
    } catch (e) {
      console.error("[openai]", e);
      if (provider !== "auto") throw e;
    }
  }

  if (tryGrok && config.xai.enabled()) {
    try {
      const content = await callGrok(prompt);
      return { content, provider: "grok" };
    } catch (e) {
      console.error("[grok]", e);
      if (provider === "grok") throw e;
    }
  }

  if (tryGemini && process.env.GEMINI_API_KEY) {
    try {
      const content = await callGemini(prompt);
      return { content, provider: "gemini" };
    } catch (e) {
      console.error("[gemini]", e);
    }
  }

  if (config.appMode === "production") {
    throw new Error("No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY.");
  }
  return { content: generateMockResponse(prompt), provider: "demo" };
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function callGrok(prompt: string): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
    timeout: 8000,
  });

  const completion = await client.chat.completions.create({
    model: process.env.XAI_MODEL || "grok-2-latest",
    max_tokens: 900,
    messages: [
      { role: "system", content: "You are an academic research assistant." },
      { role: "user", content: prompt },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
