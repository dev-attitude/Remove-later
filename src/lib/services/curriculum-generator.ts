import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import { ACADEMIC_SEARCH_SOURCE_IDS } from "@/lib/integrations/registry";
import { getResearchLevel, getWritingLevelPromptBlock, type ResearchLevelId } from "@/lib/research-levels";
import { getDisciplineLabel, type DisciplineId } from "@/lib/knowledge-library/disciplines";
import { KNOWLEDGE_LIBRARY } from "@/lib/knowledge-library/structure";
import { FOUNDATION_OPEN_RESOURCES } from "@/lib/knowledge-library/open-resources";

export type CurriculumInput = {
  researchLevel: ResearchLevelId;
  discipline: DisciplineId;
  goals?: string;
};

export type CurriculumPhase = {
  title: string;
  duration: string;
  activities: string[];
  libraryLevels: number[];
};

export type CurriculumBook = {
  title: string;
  source: string;
  reason: string;
  url?: string;
};

export type CurriculumPaper = {
  title: string;
  authors: string;
  year: number;
  source: string;
  url?: string;
};

export type GeneratedCurriculum = {
  summary: string;
  roadmap: CurriculumPhase[];
  recommendedBooks: CurriculumBook[];
  recommendedModules: { name: string; moduleId: string; reason: string }[];
  methodologies: string[];
  statisticsPath: string[];
  writingExercises: string[];
  recommendedPapers: CurriculumPaper[];
  sourcesQueried: string[];
  mode: "demo" | "live";
};

function buildCurriculumPrompt(
  input: CurriculumInput,
  papers: CurriculumPaper[]
): string {
  const level = getResearchLevel(input.researchLevel);
  const discipline = getDisciplineLabel(input.discipline);
  const writing = getWritingLevelPromptBlock(input.researchLevel);
  const levelsSummary = KNOWLEDGE_LIBRARY.map(
    (l) => `Level ${l.level}: ${l.title} — ${l.subtitle}`
  ).join("\n");

  const papersBlock =
    papers.length > 0
      ? papers
          .map(
            (p, i) =>
              `[${i + 1}] ${p.title} — ${p.authors} (${p.year}) [${p.source}]`
          )
          .join("\n")
      : "Use well-known open resources (Open Textbook Library, BCcampus) where papers are limited.";

  return `Generate a personalized AI Research Curriculum for:
- Research level: ${level?.label}
- Discipline: ${discipline}
${input.goals ? `- Student goals: ${input.goals}` : ""}

Platform knowledge library levels:
${levelsSummary}

Open resources to recommend where appropriate:
${FOUNDATION_OPEN_RESOURCES.map((r) => r.name).join(", ")}

Writing calibration:
${writing}

Recent papers from academic databases:
${papersBlock}

Return JSON only:
{
  "summary": "2-3 sentences",
  "roadmap": [{"title":"","duration":"e.g. Weeks 1-2","activities":[""],"libraryLevels":[1,2]}],
  "recommendedBooks": [{"title":"","source":"Open Textbook Library|BCcampus|etc","reason":"","url":""}],
  "recommendedModules": [{"name":"","moduleId":"writing|literature|data-analysis|tutor|proposals|research-topics|research-library","reason":""}],
  "methodologies": ["appropriate methods for discipline and level"],
  "statisticsPath": ["ordered topics for their level"],
  "writingExercises": ["practical exercises"]
}

Rules:
- Roadmap should have 4-8 phases spanning ~12-24 weeks (shorter for Bachelor's, longer for PhD)
- libraryLevels must reference platform levels 1-7
- methodologies must match discipline (${discipline}) and level (${level?.label})
- statisticsPath empty or minimal for purely qualitative paths at Bachelor's
- Include moduleIds that exist on GM Research Suite`;
}

function parseCurriculumJson(raw: string): Omit<GeneratedCurriculum, "recommendedPapers" | "sourcesQueried" | "mode"> {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

function mockCurriculum(input: CurriculumInput): GeneratedCurriculum {
  const level = getResearchLevel(input.researchLevel)?.label ?? input.researchLevel;
  const discipline = getDisciplineLabel(input.discipline);

  return {
    summary: `A structured learning path for a ${level} student in ${discipline}, progressing from research foundations through methodology, discipline practice, statistics, software, writing, and advanced skills as appropriate.`,
    roadmap: [
      {
        title: "Research foundations",
        duration: "Weeks 1–2",
        activities: [
          "Complete Level 1 topics: ethics, paradigms, academic writing",
          "Read an open textbook chapter on research process",
        ],
        libraryLevels: [1],
      },
      {
        title: "Methodology core",
        duration: "Weeks 3–6",
        activities: [
          "Study quantitative and/or qualitative methods in Level 2",
          "Select design aligned with your discipline",
        ],
        libraryLevels: [2, 3],
      },
      {
        title: "Statistics & software",
        duration: "Weeks 7–10",
        activities: [
          "Complete Statistics Academy topics for your level",
          "Practice in SPSS, JASP, or R as recommended",
        ],
        libraryLevels: [4, 5],
      },
      {
        title: "Writing & output",
        duration: "Weeks 11–16",
        activities: [
          "Draft proposal and thesis chapters using AI Writing",
          "Build reference library in Zotero",
        ],
        libraryLevels: [6, 7],
      },
    ],
    recommendedBooks: [
      {
        title: "Research Methods — Open Textbook",
        source: "Open Textbook Library",
        reason: "Free, peer-reviewed introduction aligned with Level 1",
        url: "https://open.umn.edu/opentextbooks",
      },
      {
        title: "Discipline OER collection",
        source: "BCcampus Open Education",
        reason: `Applied ${discipline} resources`,
        url: "https://open.bccampus.ca",
      },
    ],
    recommendedModules: [
      { name: "Research Topic Generator", moduleId: "research-topics", reason: "Define a level-appropriate topic" },
      { name: "Literature Review", moduleId: "literature", reason: "Search OpenAlex, Semantic Scholar, PubMed" },
      { name: "AI Research Writing", moduleId: "writing", reason: "Draft cited chapters" },
      { name: "Data Analysis / Statistics Tutor", moduleId: "data-analysis", reason: "Analyse data and interpret tests" },
    ],
    methodologies:
      input.researchLevel === "bachelors"
        ? ["Survey", "Descriptive correlational study"]
        : input.researchLevel === "phd"
          ? ["Mixed methods", "Systematic review", "Theory-building qualitative"]
          : ["Case study", "Semi-structured interviews", "Thematic analysis"],
    statisticsPath:
      input.researchLevel === "phd" || input.researchLevel === "masters"
        ? [
            "Descriptive statistics",
            "Inferential statistics",
            "Regression",
            "ANOVA",
            "Interpretation for findings chapter",
          ]
        : ["Descriptive statistics", "Chi-Square or t-tests", "Basic interpretation"],
    writingExercises: [
      `Draft a ${level}-appropriate problem statement in ${discipline}`,
      "Write one literature synthesis paragraph with 3 citations",
      "Outline methodology section with justified design",
    ],
    recommendedPapers: [],
    sourcesQueried: [],
    mode: "demo",
  };
}

async function fetchCurriculumPapers(
  discipline: string,
  level: string
): Promise<{ papers: CurriculumPaper[]; sourcesQueried: string[] }> {
  const query = `${discipline} research methodology ${level}`.slice(0, 300);
  const result = await multiSourceSearch(query, [
    "openalex",
    "semantic-scholar",
    "pubmed",
    "arxiv",
  ]);

  const papers = result.papers.slice(0, 8).map((p) => ({
    title: p.title,
    authors: p.authors,
    year: p.year,
    source: p.source,
    url: p.url ?? (p.doi ? `https://doi.org/${p.doi}` : undefined),
  }));

  return { papers, sourcesQueried: result.sourcesQueried };
}

export async function generateResearchCurriculum(
  input: CurriculumInput
): Promise<GeneratedCurriculum> {
  const mode = getRuntimeMode();
  const useLive = mode === "live" && config.openai.enabled();

  let papers: CurriculumPaper[] = [];
  let sourcesQueried: string[] = [];

  try {
    const fetched = await fetchCurriculumPapers(
      getDisciplineLabel(input.discipline),
      getResearchLevel(input.researchLevel)?.label ?? input.researchLevel
    );
    papers = fetched.papers;
    sourcesQueried = fetched.sourcesQueried;
  } catch (e) {
    console.error("[curriculum] sources:", e);
  }

  if (!useLive) {
    await new Promise((r) => setTimeout(r, 700));
    const mock = mockCurriculum(input);
    return { ...mock, recommendedPapers: papers, sourcesQueried };
  }

  try {
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: process.env.VERCEL ? 20_000 : 50_000,
    });

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      max_tokens: 2200,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are GM Research Suite curriculum designer. Output valid JSON only. Personalize to discipline and research level.",
        },
        { role: "user", content: buildCurriculumPrompt(input, papers) },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response");

    const parsed = parseCurriculumJson(content);
    return {
      ...parsed,
      recommendedPapers: papers,
      sourcesQueried,
      mode: "live",
    };
  } catch (e) {
    console.error("[curriculum] AI failed:", e);
    const mock = mockCurriculum(input);
    return { ...mock, recommendedPapers: papers, sourcesQueried, mode: "demo" };
  }
}

export { ACADEMIC_SEARCH_SOURCE_IDS };
