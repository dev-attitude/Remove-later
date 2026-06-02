import { generateAcademicText } from "@/lib/services/ai";
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
  mode: "live" | "demo";
  papers: UnifiedPaper[];
  sourcesQueried: string[];
  errors: string[];
};

function paperContextBlock(papers: UnifiedPaper[]): string {
  return papers
    .slice(0, 6)
    .map((p, i) => {
      const abs = p.abstract?.trim() || "No abstract available.";
      return `[${i + 1}] ${p.title} (${p.authors}, ${p.year}, ${p.source})\n${abs.slice(0, 500)}`;
    })
    .join("\n\n");
}

function buildFallbackOverview(
  module: string,
  topic: string,
  papers: UnifiedPaper[]
): string {
  const lines = [
    `## ${topic}`,
    "",
    `This topic is part of **${module}** in the research-learning curriculum.`,
    "",
    "### What to learn",
    `- Understand the definition and role of **${topic}** in academic research.`,
    `- Know when researchers use it and how it connects to your thesis or dissertation.`,
    `- Be able to explain it clearly in proposals, methodology chapters, and exams.`,
    "",
  ];

  if (papers.length > 0) {
    lines.push("### Supporting literature (summaries below)", "");
    for (const p of papers.slice(0, 5)) {
      lines.push(
        `**${p.title}** (${p.year}, ${p.source})`,
        "",
        p.abstract?.trim() || "_Full abstract shown in the references section._",
        "",
        "---",
        ""
      );
    }
  } else {
    lines.push(
      "_No papers were returned from connected databases for this query. Try Refresh or check back later._"
    );
  }

  return lines.join("\n");
}

async function generateAiOverview(
  module: string,
  topic: string,
  papers: UnifiedPaper[]
): Promise<{ content: string; mode: "live" | "demo" }> {
  const literature = paperContextBlock(papers);
  const prompt = `Teach university students about this research curriculum topic.

Module: ${module}
Topic: ${topic}

Write clear markdown for display INSIDE a learning platform (do not tell users to visit external websites).

Required sections:
## Overview
## Key concepts and definitions
## Why this matters in research
## Practical steps for students
## Common mistakes to avoid
## Exam-style questions (3) with brief model answers

Ground explanations in established research methods knowledge. Where literature excerpts are provided, reference them naturally. Do not invent paper titles or DOIs.

Literature excerpts:
${literature || "(No papers retrieved — use standard research methods knowledge.)"}`;

  return generateAcademicText(prompt, { maxTokens: 2400 });
}

export async function loadUnderstandingTopicContent(
  module: string,
  topic: string
): Promise<UnderstandingTopicContent> {
  const query = buildUnderstandingSearchQuery(topic);
  const search = await multiSourceSearch(query, [...UNDERSTANDING_API_SOURCE_IDS]);

  try {
    const ai = await generateAiOverview(module, topic, search.papers);
    return {
      module,
      topic,
      overview: ai.content,
      mode: ai.mode,
      papers: search.papers,
      sourcesQueried: search.sourcesQueried,
      errors: search.errors,
    };
  } catch (e) {
    console.error("[understanding-topic-content] AI failed:", e);
    return {
      module,
      topic,
      overview: buildFallbackOverview(module, topic, search.papers),
      mode: "demo",
      papers: search.papers,
      sourcesQueried: search.sourcesQueried,
      errors: search.errors,
    };
  }
}
