import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import type { UnifiedPaper } from "@/lib/integrations/types";
import {
  getResearchLevel,
  getWritingLevelPromptBlock,
  type ResearchLevelId,
} from "@/lib/research-levels";
import { getWritingTargetLabel, isWritingChapter } from "@/lib/modules";
import { generateMockResponse } from "@/lib/mock-ai";

const LITERATURE_SOURCES = ["openalex", "semantic-scholar", "pubmed"] as const;

const CHAPTER_OUTLINES: Record<string, { sections: string[]; searchHint: string }> = {
  "chapter-1": {
    searchHint: "introduction background problem significance",
    sections: [
      "1.1 Background of the study",
      "1.2 Problem statement",
      "1.3 Purpose and objectives of the study",
      "1.4 Research questions",
      "1.5 Significance of the study",
      "1.6 Delimitations and limitations",
      "1.7 Definition of key terms",
      "1.8 Organisation of the study",
    ],
  },
  "chapter-2": {
    searchHint: "literature review systematic theoretical framework",
    sections: [
      "2.1 Introduction",
      "2.2 Theoretical framework",
      "2.3 Empirical literature review (thematic)",
      "2.4 Conceptual framework",
      "2.5 Research gap",
      "2.6 Summary",
    ],
  },
  "chapter-3": {
    searchHint: "research methodology design sampling data collection",
    sections: [
      "3.1 Introduction",
      "3.2 Research design and philosophy",
      "3.3 Study population and sampling",
      "3.4 Data collection instruments",
      "3.5 Data collection procedures",
      "3.6 Data analysis plan",
      "3.7 Ethical considerations",
      "3.8 Summary",
    ],
  },
  "chapter-4": {
    searchHint: "results findings analysis presentation",
    sections: [
      "4.1 Introduction",
      "4.2 Demographic profile of participants",
      "4.3 Presentation of findings (by objective/question)",
      "4.4 Summary of key results",
    ],
  },
  "chapter-5": {
    searchHint: "discussion interpretation implications comparison literature",
    sections: [
      "5.1 Introduction",
      "5.2 Discussion of findings (linked to literature)",
      "5.3 Implications for theory, practice, and policy",
      "5.4 Limitations of the study",
      "5.5 Summary",
    ],
  },
  "chapter-6": {
    searchHint: "conclusion recommendations future research summary",
    sections: [
      "6.1 Introduction",
      "6.2 Summary of the study",
      "6.3 Conclusions",
      "6.4 Recommendations",
      "6.5 Suggestions for future research",
    ],
  },
};

export type AcademicWritingInput = {
  topic: string;
  target: string;
  researchLevel: ResearchLevelId;
};

export type SourceUsed = {
  title: string;
  authors: string;
  year: number;
  source: string;
  doi?: string;
  url?: string;
};

export type AcademicWritingResult = {
  content: string;
  mode: "demo" | "live";
  targetLabel: string;
  researchLevelLabel: string;
  sourcesUsed: SourceUsed[];
  sourcesQueried: string[];
};

function toSourceUsed(p: UnifiedPaper): SourceUsed {
  return {
    title: p.title,
    authors: p.authors,
    year: p.year,
    source: p.source,
    doi: p.doi,
    url: p.url,
  };
}

function formatSourcesBlock(papers: UnifiedPaper[]): string {
  if (papers.length === 0) {
    return "No live sources retrieved — use cautious general statements and (Author, Year) placeholders only where necessary.";
  }

  return papers
    .map((p, i) => {
      const cite = p.authors.split(",")[0]?.trim() || "Author";
      return `[${i + 1}] ${p.title}
Authors: ${p.authors} (${p.year})
Database: ${p.source}${p.doi ? ` | DOI: ${p.doi}` : ""}
Suggested in-text: (${cite}, ${p.year})
Abstract/excerpt: ${(p.abstract ?? "No abstract available.").slice(0, 400)}`;
    })
    .join("\n\n");
}

async function fetchAcademicSources(
  topic: string,
  target: string
): Promise<{ papers: UnifiedPaper[]; sourcesQueried: string[] }> {
  const isChapter = isWritingChapter(target);
  const hint = isChapter ? CHAPTER_OUTLINES[target]?.searchHint ?? "" : target;
  const limit = isChapter ? 8 : 5;

  const primary = await multiSourceSearch(
    `${topic} ${hint}`.slice(0, 400),
    [...LITERATURE_SOURCES]
  );

  let papers = primary.papers;
  const sourcesQueried = [...primary.sourcesQueried];

  if (papers.length < limit) {
    const secondary = await multiSourceSearch(
      `${topic} academic research`.slice(0, 300),
      [...LITERATURE_SOURCES]
    );
    papers = [...papers, ...secondary.papers];
    for (const s of secondary.sourcesQueried) {
      if (!sourcesQueried.includes(s)) sourcesQueried.push(s);
    }
  }

  const seen = new Set<string>();
  const unique = papers
    .filter((p) => {
      const key = p.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.citations - a.citations)
    .slice(0, isChapter ? 10 : 6);

  return { papers: unique, sourcesQueried };
}

function buildWritingPrompt(
  input: AcademicWritingInput,
  papers: UnifiedPaper[]
): string {
  const level = getResearchLevel(input.researchLevel);
  const levelWriting = getWritingLevelPromptBlock(input.researchLevel);
  const targetLabel = getWritingTargetLabel(input.target);
  const isChapter = isWritingChapter(input.target);
  const sourcesBlock = formatSourcesBlock(papers);

  const chapterBlock = isChapter
    ? `\nCHAPTER STRUCTURE — include ALL of these sections as headings:\n${(CHAPTER_OUTLINES[input.target]?.sections ?? []).map((s) => `- ${s}`).join("\n")}\n\nWrite a COMPLETE full chapter with substantive paragraphs under each section.`
    : `\nGenerate a complete, standalone "${input.target}" section (not an entire chapter).`;

  return `Research topic (mandatory focus): ${input.topic}
Research level: ${level?.label ?? input.researchLevel}
Output: ${targetLabel}
${chapterBlock}

LEVEL-SPECIFIC WRITING (strict):
${levelWriting}

CITATION & SOURCE RULES:
- Integrate at least ${isChapter ? 8 : 4} in-text citations from the SOURCES below using (Author, Year)
- Do NOT invent DOIs, author names, or study findings not supported by the sources
- End with a "References" section in APA 7th edition for every source cited
- Synthesize across multiple databases (Semantic Scholar, OpenAlex, PubMed)

HUMANIZED WRITING:
- Natural academic voice; vary sentence length and structure
- Avoid robotic phrases ("In today's rapidly evolving world", "It is important to note that")
- Read as human-authored thesis writing at the specified level

SOURCES FROM ACADEMIC DATABASES:
${sourcesBlock}`;
}

function mockWritingOutput(
  input: AcademicWritingInput,
  papers: UnifiedPaper[],
  sourcesQueried: string[]
): string {
  const targetLabel = getWritingTargetLabel(input.target);
  const level = getResearchLevel(input.researchLevel)?.label ?? input.researchLevel;
  const base = generateMockResponse(
    `Write ${targetLabel} on "${input.topic}" at ${level} level with citations`
  );

  const refs =
    papers.length > 0
      ? `\n\n## References (APA 7)\n\n${papers
          .map((p) => {
            const author = p.authors.split(";")[0] ?? p.authors;
            return `${author} (${p.year}). ${p.title}. *${p.source}*.${p.doi ? ` https://doi.org/${p.doi}` : ""}`;
          })
          .join("\n\n")}`
      : "";

  const sourceNote = `\n\n---\n*Demo mode — connected sources: ${sourcesQueried.join(", ") || "mock data"}. Add OPENAI_API_KEY for full chapter generation.*`;

  return `${base}${refs}${sourceNote}`;
}

async function callOpenAIWriting(prompt: string, isChapter: boolean): Promise<string> {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: process.env.VERCEL ? 25_000 : 60_000,
    maxRetries: 1,
  });

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: process.env.VERCEL ? (isChapter ? 2500 : 1200) : isChapter ? 4500 : 2000,
    temperature: 0.72,
    messages: [
      {
        role: "system",
        content: `You are GM Research Suite, an expert academic thesis writer.
Produce well-structured, cited, humanized academic prose.
Use ONLY provided sources for specific empirical claims and citations.
Match depth and language to the student's research level.`,
      },
      { role: "user", content: prompt },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "No content generated. Please try again."
  );
}

export async function generateAcademicWriting(
  input: AcademicWritingInput
): Promise<AcademicWritingResult> {
  const mode = getRuntimeMode();
  const useLive = mode === "live" && config.openai.enabled();
  const targetLabel = getWritingTargetLabel(input.target);
  const levelMeta = getResearchLevel(input.researchLevel);

  let papers: UnifiedPaper[] = [];
  let sourcesQueried: string[] = [];

  try {
    const fetched = await fetchAcademicSources(input.topic, input.target);
    papers = fetched.papers;
    sourcesQueried = fetched.sourcesQueried;
  } catch (e) {
    console.error("[academic-writing] source fetch:", e);
    sourcesQueried = [];
  }

  const isChapter = isWritingChapter(input.target);
  let content: string;

  if (useLive) {
    try {
      const prompt = buildWritingPrompt(input, papers);
      content = await callOpenAIWriting(prompt, isChapter);
    } catch (e) {
      console.error("[academic-writing] AI failed:", e);
      content = mockWritingOutput(input, papers, sourcesQueried);
    }
  } else {
    await new Promise((r) => setTimeout(r, 900));
    content = mockWritingOutput(input, papers, sourcesQueried);
  }

  return {
    content,
    mode: useLive ? "live" : "demo",
    targetLabel,
    researchLevelLabel: levelMeta?.label ?? input.researchLevel,
    sourcesUsed: papers.map(toSourceUsed),
    sourcesQueried,
  };
}

export function buildSmartToolPrompt(
  tool: string,
  topic: string,
  researchLevel: ResearchLevelId,
  draft?: string
): string {
  const levelWriting = getWritingLevelPromptBlock(researchLevel);
  return `Research topic: ${topic}
Research level: ${getResearchLevel(researchLevel)?.label ?? researchLevel}
Tool: ${tool}
${draft ? `Draft to transform:\n${draft}` : ""}

${levelWriting}

Apply the tool while staying on-topic and matching the research level.`;
}
