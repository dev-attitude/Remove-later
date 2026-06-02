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

async function generateAiOverview(
  module: string,
  topic: string,
  papers: UnifiedPaper[]
): Promise<string> {
  const literature = paperContextBlock(papers);
  const prompt = `Teach this research curriculum topic.

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

  const timeoutMs = process.env.VERCEL ? 55_000 : 45_000;
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: timeoutMs,
    maxRetries: 2,
  });

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
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

export async function loadUnderstandingTopicContent(
  module: string,
  topic: string
): Promise<UnderstandingTopicContent> {
  const query = buildUnderstandingSearchQuery(topic);
  const search = await multiSourceSearch(query, [...UNDERSTANDING_API_SOURCE_IDS]);

  const hasRealPapers = search.papers.length > 0;
  const runtimeLive = getRuntimeMode() === "live";

  if (!config.openai.enabled()) {
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
    const overview = await generateAiOverview(module, topic, search.papers);
    return {
      module,
      topic,
      overview,
      mode: "live",
      contentSource: "ai",
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
