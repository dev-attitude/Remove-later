import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import {
  UNDERSTANDING_API_SOURCE_IDS,
  buildUnderstandingSearchQuery,
} from "@/lib/research-suite/understanding-sources";
import type { UnifiedPaper } from "@/lib/integrations/types";

export type UnderstandingTopicContent = {
  module: string;
  topic: string;
  overview: string;
  /** live = real papers and/or live AI; demo = placeholder only */
  mode: "live" | "demo";
  /** How the learning guide was produced */
  contentSource: "ai" | "literature";
  aiProvider?: "openai" | "grok";
  papers: UnifiedPaper[];
  sourcesQueried: string[];
  errors: string[];
};

const SYSTEM_PROMPT = `You are an expert research methods educator for Skyrapay Research Suite.
Write clear, accurate study material for university students. Use markdown headings (##).
Do not tell users to leave the platform or visit external websites.
Never invent paper titles, authors, or DOIs not present in the provided excerpts.`;

function paperContextBlock(papers: UnifiedPaper[]): string {
  return papers
    .slice(0, 8)
    .map((p, i) => {
      const abs = p.abstract?.trim() || "No abstract available.";
      return `[${i + 1}] ${p.title} (${p.authors}, ${p.year}, ${p.source})\n${abs.slice(0, 800)}`;
    })
    .join("\n\n");
}

function buildLiteratureOverview(
  module: string,
  topic: string,
  papers: UnifiedPaper[]
): string {
  const lines = [
    `## ${topic}`,
    "",
    `*${module}*`,
    "",
    "## Overview",
    "",
    `**${topic}** is a core part of research training. Below is a study guide built from **real academic sources** retrieved for this topic. Read the summaries, then review the full abstracts in the references section.`,
    "",
    "## What you should understand",
    "",
    `- Define **${topic}** and explain it in your own words.`,
    `- Describe how it fits into the wider research process (problem → design → data → analysis → writing).`,
    `- Identify when researchers use it and what quality standards apply.`,
    `- Connect it to your field, thesis chapter, or exam questions.`,
    "",
  ];

  if (papers.length > 0) {
    lines.push("## Insights from academic literature", "");
    for (const p of papers.slice(0, 8)) {
      lines.push(
        `### ${p.title}`,
        "",
        `*${p.authors} (${p.year}) · ${p.source}${p.citations > 0 ? ` · ${p.citations} citations` : ""}*`,
        ""
      );
      if (p.abstract?.trim()) {
        lines.push(p.abstract.trim(), "");
      } else {
        lines.push("_Abstract not available from this database._", "");
      }
      lines.push("---", "");
    }
  } else {
    lines.push(
      "## Literature",
      "",
      "_No papers were returned from OpenAlex, Semantic Scholar, PubMed, arXiv, or CORE for this query. Use **Refresh topic** or try another related topic in the same module._",
      ""
    );
  }

  lines.push(
    "## Study checklist",
    "",
    "- [ ] I can define this topic in 2–3 sentences.",
    "- [ ] I can give one example from real research.",
    "- [ ] I know common mistakes students make here.",
    "- [ ] I reviewed at least two papers in the references list.",
    ""
  );

  return lines.join("\n");
}

function buildTopicPrompt(module: string, topic: string, papers: UnifiedPaper[]): string {
  const literature = paperContextBlock(papers);
  return `Teach this research curriculum topic.

Module: ${module}
Topic: ${topic}

Required sections:
## Overview
## Key concepts and definitions
## Why this matters in research
## Practical steps for students
## Common mistakes to avoid
## Exam-style questions (3) with brief model answers

Use the literature excerpts below where relevant. If excerpts are empty, use established research-methods knowledge only.

Literature excerpts:
${literature || "(No papers retrieved.)"}`;
}

async function chatCompletion(
  apiKey: string,
  baseURL: string | undefined,
  model: string,
  prompt: string
): Promise<string> {
  const timeoutMs = process.env.VERCEL ? 55_000 : 45_000;
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: timeoutMs,
    maxRetries: 2,
  });

  const completion = await client.chat.completions.create({
    model,
    max_tokens: process.env.VERCEL ? 1800 : 2400,
    temperature: 0.6,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty AI response");
  return text;
}

/** OpenAI first, then Grok (xAI API) — same key family as the Grok CLI uses headless */
async function generateAiOverview(
  module: string,
  topic: string,
  papers: UnifiedPaper[]
): Promise<{ content: string; provider: "openai" | "grok" }> {
  const prompt = buildTopicPrompt(module, topic, papers);

  if (config.openai.enabled()) {
    try {
      const content = await chatCompletion(
        config.openai.apiKey!,
        undefined,
        config.openai.model,
        prompt
      );
      return { content, provider: "openai" };
    } catch (e) {
      console.error("[understanding] OpenAI failed:", e);
    }
  }

  if (config.xai.enabled()) {
    const content = await chatCompletion(
      config.xai.apiKey!,
      "https://api.x.ai/v1",
      config.xai.model,
      prompt
    );
    return { content, provider: "grok" };
  }

  throw new Error("No AI provider configured (OPENAI_API_KEY or XAI_API_KEY).");
}

const MIN_REFERENCES = 4;
const MAX_REFERENCES = 12;

function mergePaperResults(
  primary: Awaited<ReturnType<typeof multiSourceSearch>>,
  extra: Awaited<ReturnType<typeof multiSourceSearch>>
) {
  const seen = new Set<string>();
  const papers: UnifiedPaper[] = [];
  for (const p of [...primary.papers, ...extra.papers]) {
    const key = `${p.title.toLowerCase().slice(0, 60)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    papers.push(p);
  }
  papers.sort((a, b) => b.citations - a.citations);
  return {
    papers: papers.slice(0, MAX_REFERENCES),
    sourcesQueried: [...new Set([...primary.sourcesQueried, ...extra.sourcesQueried])],
    errors: [...new Set([...primary.errors, ...extra.errors])],
  };
}

async function fetchTopicReferences(module: string, topic: string) {
  const primary = await multiSourceSearch(
    buildUnderstandingSearchQuery(topic),
    [...UNDERSTANDING_API_SOURCE_IDS]
  );
  if (primary.papers.length >= MIN_REFERENCES) {
    return { ...primary, papers: primary.papers.slice(0, MAX_REFERENCES) };
  }

  const moduleHint = module.replace(/^MODULE \d+:\s*/i, "").trim();
  const fallback = await multiSourceSearch(
    `${topic} ${moduleHint} research`,
    [...UNDERSTANDING_API_SOURCE_IDS]
  );
  const merged = mergePaperResults(primary, fallback);
  if (merged.papers.length > 0) return merged;

  const broad = await multiSourceSearch(topic, [...UNDERSTANDING_API_SOURCE_IDS]);
  return mergePaperResults(primary, broad);
}

export async function loadUnderstandingTopicContent(
  module: string,
  topic: string,
  options?: { useAi?: boolean }
): Promise<UnderstandingTopicContent> {
  const search = await fetchTopicReferences(module, topic);

  const hasRealPapers = search.papers.length > 0;
  const runtimeLive = getRuntimeMode() === "live";
  const useAi = options?.useAi !== false;

  if (!useAi || (!config.openai.enabled() && !config.xai.enabled())) {
    return {
      module,
      topic,
      overview: buildLiteratureOverview(module, topic, search.papers),
      mode: hasRealPapers || runtimeLive ? "live" : "demo",
      contentSource: "literature",
      papers: search.papers,
      sourcesQueried: search.sourcesQueried,
      errors: search.errors,
    };
  }

  try {
    const ai = await generateAiOverview(module, topic, search.papers);
    return {
      module,
      topic,
      overview: ai.content,
      mode: "live",
      contentSource: "ai",
      aiProvider: ai.provider,
      papers: search.papers,
      sourcesQueried: search.sourcesQueried,
      errors: search.errors,
    };
  } catch (e) {
    console.error("[understanding-topic-content] OpenAI failed, using literature guide:", e);
    return {
      module,
      topic,
      overview: buildLiteratureOverview(module, topic, search.papers),
      mode: hasRealPapers ? "live" : "demo",
      contentSource: "literature",
      papers: search.papers,
      sourcesQueried: search.sourcesQueried,
      errors: [
        ...search.errors,
        ...(hasRealPapers
          ? []
          : ["AI guide unavailable — configure OPENAI_API_KEY on the server for full guides."]),
      ],
    };
  }
}
