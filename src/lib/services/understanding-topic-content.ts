import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import {
  UNDERSTANDING_API_SOURCE_IDS,
  buildUnderstandingSearchQuery,
} from "@/lib/research-suite/understanding-sources";
import type { UnifiedPaper } from "@/lib/integrations/types";
import {
  type BookExcerpt,
  formatBookExcerptsForPrompt,
  getBookExcerptsForTopic,
} from "@/lib/services/understanding-books";
import { buildTopicSearchPhrases, phraseMatchScore } from "@/lib/services/book-topic-match";
import { formatExtractedBookText, normalizeGuideMarkdown } from "@/lib/services/format-book-text";
import {
  getCachedTopicContent,
  setCachedTopicContent,
} from "@/lib/services/understanding-topic-cache";

export type TopicReference = {
  id: string;
  type: "textbook" | "paper" | "ai";
  title: string;
  authors?: string;
  year?: number;
  source: string;
  excerpt?: string;
  doi?: string;
  citations?: number;
};

export type UnderstandingTopicContent = {
  module: string;
  topic: string;
  overview: string;
  mode: "live" | "demo";
  contentSource: "ai" | "literature";
  aiProvider?: "openai" | "grok";
  /** Unified references: textbooks, AI synthesis, and library papers */
  references: TopicReference[];
  papers: UnifiedPaper[];
  sourcesQueried: string[];
  errors: string[];
  booksUsed?: { id: string; title: string }[];
  fromCache?: boolean;
  phase?: "quick" | "full";
};

const SYSTEM_PROMPT = `You are an expert research methods educator for Skyrapay Research Suite.
Write a unified academic study guide for university students.

Rules:
- Use clear markdown: ## for main sections only (Overview, Key concepts and definitions, Why this matters in research, Practical steps for students, Common mistakes to avoid, Exam-style questions).
- Write in flowing paragraphs under each section. Use bullet lists only where they improve clarity.
- Synthesise ALL provided textbook and literature material into ONE coherent guide. Do NOT split content by source.
- Do NOT use headings like "From course textbooks", "From OpenAlex", or name individual books as section titles.
- Do NOT include a references or bibliography section — the application lists sources separately.
- Do not tell users to leave the platform or visit external websites.
- Never invent paper titles, authors, or DOIs not present in the provided source material.
- Focus the guide on the exact topic requested. Use only source material that relates to that topic; do not paste generic introductions about research in general unless they define this topic.`;

function paperContextBlock(papers: UnifiedPaper[]): string {
  return papers
    .slice(0, 8)
    .map((p, i) => {
      const abs = p.abstract?.trim() || "No abstract available.";
      return `[${i + 1}] ${p.title} (${p.authors}, ${p.year}, ${p.source})\n${abs.slice(0, 800)}`;
    })
    .join("\n\n");
}

function buildTopicReferences(
  bookExcerpts: BookExcerpt[],
  papers: UnifiedPaper[],
  ai?: { provider: "openai" | "grok" }
): TopicReference[] {
  const refs: TopicReference[] = [];

  for (const b of bookExcerpts) {
    refs.push({
      id: `book-${b.bookId}`,
      type: "textbook",
      title: b.title,
      source: "Course textbook",
      excerpt: b.excerpt.slice(0, 500).trim() + (b.excerpt.length > 500 ? "…" : ""),
    });
  }

  if (ai) {
    refs.push({
      id: "ai-synthesis",
      type: "ai",
      title: "Learning guide synthesis",
      source: ai.provider === "grok" ? "Grok (xAI)" : "OpenAI",
      excerpt:
        "Study guide text synthesised from course textbooks and academic literature for this topic.",
    });
  }

  for (const p of papers) {
    refs.push({
      id: p.id,
      type: "paper",
      title: p.title,
      authors: p.authors,
      year: p.year,
      source: p.source,
      excerpt: p.abstract,
      doi: p.doi,
      citations: p.citations,
    });
  }

  return refs;
}

/** Non-AI guide: unified paragraphs only — sources appear in references, not in the body */
function buildSynthesizedGuide(
  module: string,
  topic: string,
  bookExcerpts: BookExcerpt[]
): string {
  const phrases = buildTopicSearchPhrases(module, topic);
  const proseBlocks: string[] = [];

  const sorted = [...bookExcerpts].sort((a, b) => b.relevance - a.relevance);

  for (const b of sorted) {
    const formatted = formatExtractedBookText(b.excerpt, topic);
    const paragraphs = formatted
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => {
        if (p.length < 60) return false;
        if (p.startsWith("**Chapter outline")) return false;
        if (p.startsWith("---") || p.startsWith("**Focus:")) return false;
        if (p.startsWith("###")) {
          proseBlocks.push(p);
          return false;
        }
        return phraseMatchScore(p, phrases) >= 6 || proseBlocks.length < 2;
      });
    proseBlocks.push(...paragraphs);
  }

  const unique = [...new Set(proseBlocks)].slice(0, 10);
  const overview =
    unique.slice(0, 2).join("\n\n") ||
    `${topic} is a fundamental part of research training within ${module.replace(/^MODULE \d+:\s*/i, "")}. Understanding this topic helps you design, conduct, and report research with academic rigour.`;

  const concepts =
    unique.slice(2, 5).join("\n\n") ||
    `Researchers approach ${topic} systematically: defining terms clearly, linking theory to practice, and applying ethical and methodological standards throughout the research process.`;

  const practice =
    unique.slice(5, 7).join("\n\n") ||
    `Apply this topic by reviewing how it appears in published studies in your field, noting definitions used by authors, and practising with short exercises or past exam questions.`;

  const lines = [
    `## ${topic}`,
    "",
    `*${module}*`,
    "",
    "## Overview",
    "",
    overview,
    "",
    "## Key concepts and definitions",
    "",
    concepts,
    "",
    "## Why this matters in research",
    "",
    `A clear grasp of **${topic}** strengthens every stage of a research project — from framing a problem and choosing methods to analysing data and writing defensible conclusions.`,
    "",
    "## Practical steps for students",
    "",
    practice,
    "",
    "## Common mistakes to avoid",
    "",
    `- Treating ${topic} as optional rather than foundational to your design and write-up.`,
    "- Using vague definitions without tying them to your research question.",
    "- Ignoring how supervisors and examiners expect this concept to appear in your proposal or thesis.",
    "",
    "## Exam-style questions",
    "",
    `1. Define **${topic}** and explain its role in the research process.`,
    "",
    `2. Give one example of how ${topic} applies in your discipline.`,
    "",
    `3. What are two common errors students make regarding ${topic}, and how would you avoid them?`,
    "",
  ];

  return normalizeGuideMarkdown(lines.join("\n"));
}

function finalizeGuideMarkdown(text: string): string {
  return normalizeGuideMarkdown(text);
}

function buildTopicPrompt(
  module: string,
  topic: string,
  papers: UnifiedPaper[],
  bookExcerpts: BookExcerpt[]
): string {
  const literature = paperContextBlock(papers);
  const formattedExcerpts = bookExcerpts.map((b) => ({
    ...b,
    excerpt: formatExtractedBookText(b.excerpt, topic),
  }));
  const textbooks = formatBookExcerptsForPrompt(formattedExcerpts);

  return `Write a unified study guide for this curriculum topic. Synthesise the source material below into clear paragraphs — do not organise the guide by source.

Module: ${module}
Topic (stay focused on this — not a generic introduction to research): ${topic}

Source material (for synthesis only — do not list these separately in your output):

${textbooks ? `TEXTBOOK EXCERPTS:\n${textbooks}\n\n` : ""}${literature ? `ACADEMIC LITERATURE:\n${literature}` : "(No literature retrieved.)"}

Write sections: ## Overview, ## Key concepts and definitions, ## Why this matters in research, ## Practical steps for students, ## Common mistakes to avoid, ## Exam-style questions (3 questions with brief model answers).`;
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

async function generateAiOverview(
  module: string,
  topic: string,
  papers: UnifiedPaper[],
  bookExcerpts: BookExcerpt[]
): Promise<{ content: string; provider: "openai" | "grok" }> {
  const prompt = buildTopicPrompt(module, topic, papers, bookExcerpts);

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
  return mergePaperResults(primary, fallback);
}

/** Fast path: textbook excerpts only — shown while the full guide loads */
export async function loadUnderstandingTopicQuick(
  module: string,
  topic: string
): Promise<UnderstandingTopicContent> {
  const bookExcerpts = await getBookExcerptsForTopic(module, topic);
  const booksUsed = bookExcerpts.map((b) => ({ id: b.bookId, title: b.title }));

  return {
    module,
    topic,
    overview: buildSynthesizedGuide(module, topic, bookExcerpts),
    mode: bookExcerpts.length > 0 ? "live" : "demo",
    contentSource: "literature",
    references: buildTopicReferences(bookExcerpts, []),
    papers: [],
    sourcesQueried:
      booksUsed.length > 0 ? [`Course textbooks (${booksUsed.length})`] : [],
    errors: [],
    booksUsed: booksUsed.length > 0 ? booksUsed : undefined,
    phase: "quick",
  };
}

export async function loadUnderstandingTopicContent(
  module: string,
  topic: string,
  options?: {
    useAi?: boolean;
    /** When trial ended, still synthesise textbook excerpts with AI */
    allowBookAi?: boolean;
    phase?: "quick" | "full";
    refresh?: boolean;
  }
): Promise<UnderstandingTopicContent> {
  if (options?.phase === "quick") {
    return loadUnderstandingTopicQuick(module, topic);
  }

  if (!options?.refresh) {
    const cached = await getCachedTopicContent(module, topic);
    if (cached) return { ...cached, phase: "full" };
  }

  const [search, bookExcerpts] = await Promise.all([
    fetchTopicReferences(module, topic),
    getBookExcerptsForTopic(module, topic),
  ]);
  const booksUsed = bookExcerpts.map((b) => ({ id: b.bookId, title: b.title }));

  const hasRealPapers = search.papers.length > 0;
  const runtimeLive = getRuntimeMode() === "live";
  const trialAi = options?.useAi !== false;
  const hasBooks = bookExcerpts.length > 0;
  const aiConfigured = config.openai.enabled() || config.xai.enabled();
  const runAi = aiConfigured && (trialAi || (options?.allowBookAi && hasBooks));

  const sourcesQueried = [
    ...search.sourcesQueried,
    ...(booksUsed.length > 0 ? [`Course textbooks (${booksUsed.length})`] : []),
  ];

  const base = {
    module,
    topic,
    papers: search.papers,
    sourcesQueried,
    errors: search.errors,
    booksUsed: booksUsed.length > 0 ? booksUsed : undefined,
  };

  if (!runAi) {
    const result: UnderstandingTopicContent = {
      ...base,
      overview: buildSynthesizedGuide(module, topic, bookExcerpts),
      mode: hasRealPapers || runtimeLive || bookExcerpts.length > 0 ? "live" : "demo",
      contentSource: "literature",
      references: buildTopicReferences(bookExcerpts, search.papers),
      phase: "full",
    };
    await setCachedTopicContent(module, topic, result).catch((e) =>
      console.error("[understanding-topic-content] cache write failed:", e)
    );
    return result;
  }

  try {
    const ai = await generateAiOverview(module, topic, search.papers, bookExcerpts);
    const result: UnderstandingTopicContent = {
      ...base,
      overview: finalizeGuideMarkdown(ai.content),
      mode: "live",
      contentSource: "ai",
      aiProvider: ai.provider,
      references: buildTopicReferences(bookExcerpts, search.papers, {
        provider: ai.provider,
      }),
      phase: "full",
    };
    await setCachedTopicContent(module, topic, result).catch((e) =>
      console.error("[understanding-topic-content] cache write failed:", e)
    );
    return result;
  } catch (e) {
    console.error("[understanding-topic-content] AI failed, using synthesized guide:", e);
    const result: UnderstandingTopicContent = {
      ...base,
      overview: buildSynthesizedGuide(module, topic, bookExcerpts),
      mode: hasRealPapers || bookExcerpts.length > 0 ? "live" : "demo",
      contentSource: "literature",
      references: buildTopicReferences(bookExcerpts, search.papers),
      errors: [
        ...search.errors,
        ...(hasRealPapers || bookExcerpts.length > 0
          ? []
          : ["AI guide unavailable — configure OPENAI_API_KEY on the server for full guides."]),
      ],
      phase: "full",
    };
    await setCachedTopicContent(module, topic, result).catch(() => {});
    return result;
  }
}
