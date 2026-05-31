import { NextResponse } from "next/server";
import { INTEGRATION_SOURCES } from "@/lib/integrations/registry";
import { config } from "@/lib/config";

export async function GET() {
  const sources = INTEGRATION_SOURCES.map((s) => ({
    ...s,
    configured: s.requiresKey
      ? Boolean(process.env[s.requiresKey])
      : s.apiEnabled,
    openAi: s.id === "openai" ? config.openai.enabled() : undefined,
    gemini: s.id === "gemini" ? Boolean(process.env.GEMINI_API_KEY) : undefined,
    grok: s.id === "grok" ? Boolean(process.env.XAI_API_KEY) : undefined,
  }));

  return NextResponse.json({ sources });
}
