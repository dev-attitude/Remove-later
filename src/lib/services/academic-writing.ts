import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import type { UnifiedPaper } from "@/lib/integrations/types";
import {
  getResearchLevel,
  getWritingLevelPromptBlock,
  type ResearchLevelId,
} from "@/lib/research-levels";
import { getWritingTargetLabel, isWritingChapter, SMART_TOOLS } from "@/lib/modules";

const SMART_TOOLS_SET = new Set<string>(SMART_TOOLS);

const LITERATURE_SOURCES = ["openalex", "semantic-scholar", "pubmed", "arxiv"] as const;

const SECTION_SEARCH_HINTS: Record<string, string> = {
  "Problem statements": "problem statement research gap barriers predictors",
  "Background of study": "background context prevalence",
  "Research objectives": "research objectives aims",
  "Research questions": "research questions",
  Hypothesis: "hypothesis theoretical framework",
  "Literature review": "literature review systematic",
  Methodology: "research methodology design sampling",
  Findings: "results findings analysis",
  Discussion: "discussion implications",
  Recommendations: "recommendations policy practice",
  Abstract: "abstract summary",
  Conclusion: "conclusion summary",
};

const SOURCE_FETCH_MS = process.env.VERCEL ? 9_000 : 25_000;

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
  /** Shown when live AI failed but literature was retrieved */
  notice?: string;
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

function dedupePapers(papers: UnifiedPaper[], max: number): UnifiedPaper[] {
  const seen = new Set<string>();
  return papers
    .filter((p) => {
      const key = p.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.citations - a.citations)
    .slice(0, max);
}

async function fetchAcademicSources(
  topic: string,
  target: string
): Promise<{ papers: UnifiedPaper[]; sourcesQueried: string[] }> {
  const isChapter = isWritingChapter(target);
  const hint = isChapter
    ? CHAPTER_OUTLINES[target]?.searchHint ?? ""
    : SECTION_SEARCH_HINTS[target] ?? target;
  const max = isChapter ? 10 : 6;

  const run = async () => {
    const query = `${topic} ${hint}`.slice(0, 400);
    const primary = await multiSourceSearch(query, [...LITERATURE_SOURCES]);
    let papers = primary.papers;
    const sourcesQueried = [...primary.sourcesQueried];

    if (papers.length < 4) {
      const secondary = await multiSourceSearch(topic.slice(0, 280), [
        "openalex",
        "semantic-scholar",
      ]);
      papers = [...papers, ...secondary.papers];
      for (const s of secondary.sourcesQueried) {
        if (!sourcesQueried.includes(s)) sourcesQueried.push(s);
      }
    }

    return { papers: dedupePapers(papers, max), sourcesQueried };
  };

  try {
    return await Promise.race([
      run(),
      new Promise<{ papers: UnifiedPaper[]; sourcesQueried: string[] }>((_, reject) =>
        setTimeout(() => reject(new Error("Source fetch timeout")), SOURCE_FETCH_MS)
      ),
    ]);
  } catch (e) {
    console.error("[academic-writing] fetch timeout or error:", e);
    return { papers: [], sourcesQueried: [] };
  }
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

  const isSmartTool = SMART_TOOLS_SET.has(input.target);

  const chapterBlock = isChapter
    ? `\nCHAPTER STRUCTURE — include ALL of these sections as headings:\n${(CHAPTER_OUTLINES[input.target]?.sections ?? []).map((s) => `- ${s}`).join("\n")}\n\nWrite a COMPLETE full chapter with substantive paragraphs under each section.`
    : isSmartTool
      ? `\nApply this writing tool to the research topic: "${input.target}". Output the transformed/improved text only.`
      : `\nGenerate a complete, standalone "${input.target}" section (not an entire chapter).`;

  return `Research topic (mandatory focus): ${input.topic}
Research level: ${level?.label ?? input.researchLevel}
Output: ${targetLabel}
${chapterBlock}

CRITICAL: Write the actual ${targetLabel} text ready to paste into a thesis. Do NOT describe what the section should contain. Do NOT use placeholder meta-commentary.

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

function firstAuthor(p: UnifiedPaper): string {
  const a = p.authors.split(/[,;]/)[0]?.trim();
  return a || "Author";
}

function formatReferences(papers: UnifiedPaper[]): string {
  if (papers.length === 0) return "";
  return `\n\n## References (APA 7)\n\n${papers
    .map((p) => {
      const author = p.authors.split(";")[0] ?? p.authors;
      return `${author} (${p.year}). ${p.title}. *${p.source}*.${p.doi ? ` https://doi.org/${p.doi}` : ""}`;
    })
    .join("\n\n")}`;
}

function buildStructuredFallback(
  input: AcademicWritingInput,
  papers: UnifiedPaper[]
): string {
  const level = getResearchLevel(input.researchLevel)?.label ?? input.researchLevel;
  const target = getWritingTargetLabel(input.target);
  const topic = input.topic;
  const c1 = papers[0] ? `(${firstAuthor(papers[0])}, ${papers[0].year})` : "(Author, Year)";
  const c2 = papers[1] ? `(${firstAuthor(papers[1])}, ${papers[1].year})` : c1;
  const c3 = papers[2] ? `(${firstAuthor(papers[2])}, ${papers[2].year})` : c1;

  if (input.target === "Problem statements") {
    return `## Problem statement

Despite growing attention to workforce and service-delivery challenges in health and social care, evidence remains uneven on the factors that help or hinder effective practice in the context of this study: ${topic}. Prior research indicates that structural, organisational, and behavioural barriers can limit outcomes for patients and communities ${c1}, while supportive leadership, resources, and interdisciplinary collaboration may improve performance ${c2}. However, there is still a limited synthesis of predictors and barriers specifically affecting the professional groups and settings implied in the present topic, particularly within the local context under investigation ${c3}.

At ${level} level, the problem can be stated as follows: there is insufficient empirically grounded understanding of the predictors and barriers affecting nurses, doctors, interns, social workers, occupational therapists, and related practitioners in relation to ${topic}. This gap constrains evidence-based policy, training, and organisational decision-making. Without addressing this problem, institutions risk implementing interventions that are not aligned with the real constraints and enablers experienced in practice.

Therefore, this study is warranted to generate context-specific evidence that can inform targeted strategies, strengthen practice, and contribute scholarly insight appropriate to ${level} research.${formatReferences(papers)}`;
  }

  return `## ${target}

This ${target.toLowerCase()} addresses the research topic: ${topic}, at ${level} level.

The study is situated within an established body of work showing that the phenomenon under investigation has practical and scholarly significance ${c1}. Recent studies highlight methodological and contextual nuances that must be accounted for in the present setting ${c2}, while gaps remain in how findings from comparable populations apply to the current research context ${c3}.

[Expand each paragraph with your local context, population, and methods. The references below were retrieved from OpenAlex, Semantic Scholar, and PubMed to support cited claims.]${formatReferences(papers)}`;
}

function isLowQualityAiOutput(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("this section follows academic structure") ||
    lower.includes("## generated content") ||
    lower.includes("next steps:") && lower.includes("refine with")
  );
}

async function callOpenAIWriting(prompt: string, isChapter: boolean): Promise<string> {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: process.env.VERCEL ? 50_000 : 90_000,
    maxRetries: 1,
  });

  const system = `You are GM Research Suite, an expert academic thesis writer.
Write the final thesis text the student will submit — not instructions about how to write.
Use in-text citations (Author, Year) from the provided sources only.
Humanized, level-appropriate academic English. Include a References section (APA 7).`;

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: process.env.VERCEL ? (isChapter ? 2800 : 1600) : isChapter ? 4500 : 2200,
    temperature: 0.68,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text || text.length < 80) {
    throw new Error("Empty or too-short AI response");
  }
  if (isLowQualityAiOutput(text)) {
    throw new Error("Low-quality template response");
  }
  return text;
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
  let resultMode: "demo" | "live" = useLive ? "live" : "demo";
  let notice: string | undefined;

  if (useLive) {
    try {
      const prompt = buildWritingPrompt(input, papers);
      content = await callOpenAIWriting(prompt, isChapter);
    } catch (e) {
      console.error("[academic-writing] AI failed:", e);
      content = buildStructuredFallback(input, papers);
      resultMode = "demo";
      notice =
        "Live AI timed out or was unavailable. Showing a structured draft using your topic and retrieved literature. Please try again in a moment, or check OpenAI billing on Vercel.";
    }
  } else {
    await new Promise((r) => setTimeout(r, 400));
    content = buildStructuredFallback(input, papers);
    resultMode = "demo";
    notice =
      "Demo mode — set GM_APP_MODE=production and OPENAI_API_KEY on Vercel for full AI generation.";
  }

  return {
    content,
    mode: resultMode,
    targetLabel,
    researchLevelLabel: levelMeta?.label ?? input.researchLevel,
    sourcesUsed: papers.map(toSourceUsed),
    sourcesQueried,
    notice,
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
