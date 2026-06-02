import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import type { UnifiedPaper } from "@/lib/integrations/types";
import { RESEARCH_METHODS } from "@/lib/research-methods";
import {
  getResearchLevel,
  getResearchLevelPromptBlock,
  type ResearchLevelId,
} from "@/lib/research-levels";

export { RESEARCH_METHODS };

export type TopicGenerationInput = {
  fieldOfStudy: string;
  problems: string;
  researchLocation: string;
  researchMethod: string;
  researchLevel: ResearchLevelId;
};

export type GeneratedTopic = {
  id: string;
  title: string;
  rationale: string;
  researchQuestions: string[];
  alignmentNote: string;
};

export type TopicWithArticles = {
  topic: GeneratedTopic;
  articles: UnifiedPaper[];
};

export type TopicGenerationResult = {
  topics: TopicWithArticles[];
  mode: "demo" | "live";
  researchLevel: ResearchLevelId;
  researchLevelLabel: string;
};

const TOPIC_JSON_SCHEMA = `{
  "topics": [
    {
      "title": "string — specific, researchable title",
      "rationale": "string — why this topic fits the student's context (2-4 sentences)",
      "researchQuestions": ["string", "string"],
      "alignmentNote": "string — how method and location support feasibility"
    }
  ]
}`;

function buildTopicPrompt(input: TopicGenerationInput): string {
  const level = getResearchLevel(input.researchLevel);
  const levelBlock = getResearchLevelPromptBlock(input.researchLevel);

  return `You are an academic supervisor helping a student choose a research topic.

Student profile:
- Research level: ${level?.label ?? input.researchLevel} (${level?.complexity ?? "academic"} complexity; originality: ${level?.originality ?? "as appropriate"})
- Field of study: ${input.fieldOfStudy}
- Problems observed or to address: ${input.problems}
- Research location / context: ${input.researchLocation}
- Preferred research method: ${input.researchMethod}

LEVEL-SPECIFIC REQUIREMENTS (strictly follow):
${levelBlock}

Generate exactly 3 DISTINCT, high-quality research topics calibrated ONLY for this research level.
- Bachelor's topics must be simpler than Master's; PhD topics must require original contribution — never treat all levels the same
- Be feasible in the stated location using the chosen method
- Address different angles of the stated problems (not three rephrasings of the same idea)
- Match vocabulary and ambition to the level (clearer language for Bachelor's; theoretical depth for PhD)
- Include 2-3 focused research questions per topic appropriate to the level
- In alignmentNote, briefly state why the topic fits THIS level (complexity, originality, feasibility)

Respond ONLY with valid JSON matching this schema (no markdown):
${TOPIC_JSON_SCHEMA}`;
}

function parseTopicsJson(raw: string): GeneratedTopic[] {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  const data = JSON.parse(cleaned) as {
    topics?: Array<{
      title?: string;
      rationale?: string;
      researchQuestions?: string[];
      alignmentNote?: string;
    }>;
  };

  const list = data.topics ?? [];
  if (list.length < 3) {
    throw new Error("Expected at least 3 topics");
  }

  return list.slice(0, 5).map((t, i) => ({
    id: `topic-${i + 1}`,
    title: t.title?.trim() || `Research topic ${i + 1}`,
    rationale: t.rationale?.trim() || "",
    researchQuestions: (t.researchQuestions ?? []).filter(Boolean).slice(0, 4),
    alignmentNote: t.alignmentNote?.trim() || "",
  }));
}

function mockTopics(input: TopicGenerationInput): GeneratedTopic[] {
  const field = input.fieldOfStudy;
  const loc = input.researchLocation;
  const method = input.researchMethod;
  const byLevel: Record<ResearchLevelId, GeneratedTopic[]> = {
    bachelors: [
      {
        id: "topic-1",
        title: `Factors associated with ${field.toLowerCase()} challenges among students in ${loc}`,
        rationale: `A descriptive Bachelor's-level study applying existing knowledge. Suitable for small samples and basic analysis using ${method}.`,
        researchQuestions: [
          `What is the prevalence of the stated problems in the study population?`,
          `What factors are associated with these problems?`,
        ],
        alignmentNote: `Bachelor's scope: limited literature review, basic statistics, high supervisor guidance — feasible in ${loc}.`,
      },
      {
        id: "topic-2",
        title: `Knowledge and attitudes towards addressing ${field.toLowerCase()} issues in ${loc}`,
        rationale: `Classic undergraduate design focusing on knowledge, attitudes, and practices without claiming new theory.`,
        researchQuestions: [
          `What is the level of knowledge regarding the identified problems?`,
          `What attitudes do participants hold towards prevention or intervention?`,
        ],
        alignmentNote: `Matches Bachelor's expectations — no original contribution required; ${method} with modest sample.`,
      },
      {
        id: "topic-3",
        title: `Assessment of current practices related to ${field} in ${loc}`,
        rationale: `Documents how institutions or communities currently respond to the problems you described; appropriate depth for an undergraduate dissertation.`,
        researchQuestions: [
          `What practices are currently in place?`,
          `What barriers affect implementation of recommended practices?`,
        ],
        alignmentNote: `Basic critical analysis; applies established concepts rather than creating new knowledge.`,
      },
    ],
    "postgraduate-diploma": [
      {
        id: "topic-1",
        title: `Evaluation of workplace interventions for ${field.toLowerCase()} in ${loc}`,
        rationale: `Applied professional research evaluating whether current programmes address the problems you identified — typical Postgraduate Diploma focus.`,
        researchQuestions: [
          `How effectively does the current intervention address the stated problems?`,
          `What improvements do staff and managers recommend?`,
        ],
        alignmentNote: `Postgraduate Diploma: applied, program evaluation, moderate analysis — not theory-building.`,
      },
      {
        id: "topic-2",
        title: `Policy and compliance assessment for ${field} practice standards in ${loc}`,
        rationale: `Supports policy analysis and professional practice improvement in an organisational setting.`,
        researchQuestions: [
          `To what extent are professional standards met in practice?`,
          `What organisational factors influence compliance?`,
        ],
        alignmentNote: `More critical than Bachelor's; workplace-oriented; limited expectation of novel contribution.`,
      },
      {
        id: "topic-3",
        title: `Stakeholder perspectives on service delivery gaps in ${field} (${loc})`,
        rationale: `Professional practice research using ${method} to inform institutional decision-making.`,
        researchQuestions: [
          `What service delivery gaps do stakeholders identify?`,
          `What feasible changes could improve outcomes?`,
        ],
        alignmentNote: `Diploma-level applied research with moderate literature review and practical recommendations.`,
      },
    ],
    masters: [
      {
        id: "topic-1",
        title: `Factors influencing outcomes related to ${field.toLowerCase()} in ${loc}: a gap-driven study`,
        rationale: `Master's-level research with extensive literature review, clear gap, and advanced analysis using ${method}.`,
        researchQuestions: [
          `What does existing literature identify as key predictors in comparable contexts?`,
          `Which factors significantly influence outcomes in ${loc} after controlling for confounders?`,
        ],
        alignmentNote: `Master's: strong methodology justification, research gap, critical discussion — independent scholarship expected.`,
      },
      {
        id: "topic-2",
        title: `Predictors and barriers affecting ${field.toLowerCase()} interventions in ${loc}`,
        rationale: `Enables critical evaluation of prior studies and contribution of new empirical insights to the field.`,
        researchQuestions: [
          `What gaps exist in current evidence for this population?`,
          `How do predictors and barriers interact to affect intervention success?`,
        ],
        alignmentNote: `Requires advanced data analysis and extensive synthesis — beyond Bachelor's descriptive scope.`,
      },
      {
        id: "topic-3",
        title: `Critical synthesis and primary investigation of ${field} challenges in ${loc}`,
        rationale: `Combines rigorous literature critique with primary data collection justified by identified gaps.`,
        researchQuestions: [
          `How do local findings align with or diverge from international evidence?`,
          `What implications arise for theory, policy, and practice?`,
        ],
        alignmentNote: `Master's contribution: new insights, not replication; publication potential sometimes expected.`,
      },
    ],
    phd: [
      {
        id: "topic-1",
        title: `Development and validation of a theoretical framework for ${field.toLowerCase()} in resource-limited settings (${loc})`,
        rationale: `PhD-calibre originality: proposes new knowledge through framework development and validation — answers "what new knowledge does this add?"`,
        researchQuestions: [
          `What theoretical gaps limit current understanding in this discipline?`,
          `How can a novel framework be developed, validated, and tested in ${loc}?`,
        ],
        alignmentNote: `PhD: comprehensive literature review, sophisticated ${method}, publication-ready contribution required.`,
      },
      {
        id: "topic-2",
        title: `A multi-phase programme of research advancing ${field} theory and practice in ${loc}`,
        rationale: `Substantial doctoral study integrating theory-building with empirical phases over multiple years.`,
        researchQuestions: [
          `What original theoretical propositions emerge from integrating prior evidence?`,
          `How do empirical phases confirm, refine, or extend the proposed contribution?`,
        ],
        alignmentNote: `Very advanced complexity; expert critical analysis; examiner will assess novelty explicitly.`,
      },
      {
        id: "topic-3",
        title: `Novel model for addressing ${field.toLowerCase()} problems: design, validation, and scholarly contribution (${loc})`,
        rationale: `Creates defensible new knowledge — not descriptive replication — suitable for journal publication and independent scholarship.`,
        researchQuestions: [
          `What is the novel contribution to the discipline beyond existing models?`,
          `How does methodological rigour ensure generalisability and scholarly impact?`,
        ],
        alignmentNote: `PhD essential: research gap identification, advanced framework, often expected publication output.`,
      },
    ],
  };

  return byLevel[input.researchLevel] ?? byLevel.bachelors;
}

function mockArticles(topic: GeneratedTopic, input: TopicGenerationInput): UnifiedPaper[] {
  const base = topic.title.slice(0, 60);
  const levelLabel = getResearchLevel(input.researchLevel)?.label ?? input.researchLevel;
  const years = [2024, 2023, 2022, 2021, 2020, 2019];
  const sources = ["OpenAlex", "Semantic Scholar", "PubMed", "Crossref", "OpenAlex", "Semantic Scholar"];

  return years.map((year, i) => ({
    id: `demo-${topic.id}-${i}`,
    title: `${base}: empirical study ${i + 1}`,
    authors: i % 2 === 0 ? "Müller, K. et al." : "Amutenya, L.; Shikongo, T.",
    year,
    source: sources[i],
    sourceId: sources[i].toLowerCase().replace(/\s/g, "-"),
    citations: 120 - i * 15,
    doi: i % 3 === 0 ? `10.1000/demo.${topic.id}.${i}` : undefined,
    url: `https://example.org/paper/${topic.id}/${i}`,
    gap: i === 0 ? `Limited studies in ${input.researchLocation}` : undefined,
    abstract: `Related ${levelLabel} work on ${input.fieldOfStudy} using methods comparable to ${input.researchMethod}.`,
  }));
}

async function generateTopicsWithAI(input: TopicGenerationInput): Promise<GeneratedTopic[]> {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: process.env.VERCEL ? 12_000 : 45_000,
    maxRetries: 1,
  });

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: 1800,
    temperature: 0.75,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You generate original, ethical, feasible academic research topics. Output valid JSON only.",
      },
      { role: "user", content: buildTopicPrompt(input) },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty AI response");
  return parseTopicsJson(content);
}

async function fetchArticlesForTopic(
  topic: GeneratedTopic,
  input: TopicGenerationInput,
  minCount = 5
): Promise<UnifiedPaper[]> {
  const query = `${topic.title} ${input.fieldOfStudy} ${input.researchLocation}`.slice(0, 400);

  const result = await multiSourceSearch(query, [
    "openalex",
    "semantic-scholar",
    "pubmed",
    "arxiv",
    "core",
  ]);
  let papers = result.papers;

  if (papers.length < minCount) {
    const broader = await multiSourceSearch(
      `${input.fieldOfStudy} ${input.problems.slice(0, 120)}`,
      ["openalex", "semantic-scholar"]
    );
    papers = [...papers, ...broader.papers];
  }

  const seen = new Set<string>();
  const unique = papers.filter((p) => {
    const key = p.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique
    .sort((a, b) => b.citations - a.citations)
    .slice(0, Math.max(minCount, 6));
}

export async function generateResearchTopicsWithLiterature(
  input: TopicGenerationInput
): Promise<TopicGenerationResult> {
  const mode = getRuntimeMode();
  const useLive = mode === "live" && config.openai.enabled();

  let topics: GeneratedTopic[];

  if (useLive) {
    try {
      topics = await generateTopicsWithAI(input);
    } catch (e) {
      console.error("[research-topics] AI failed:", e);
      topics = mockTopics(input);
    }
  } else {
    await new Promise((r) => setTimeout(r, 800));
    topics = mockTopics(input);
  }

  const topicsWithArticles: TopicWithArticles[] = [];

  for (const topic of topics.slice(0, 3)) {
    let articles: UnifiedPaper[];

    if (useLive) {
      try {
        articles = await fetchArticlesForTopic(topic, input, 5);
        if (articles.length < 5) {
          articles = [...articles, ...mockArticles(topic, input)].slice(0, 6);
        }
      } catch {
        articles = mockArticles(topic, input);
      }
    } else {
      articles = mockArticles(topic, input);
    }

    topicsWithArticles.push({ topic, articles });
  }

  const levelMeta = getResearchLevel(input.researchLevel);

  return {
    topics: topicsWithArticles,
    mode: useLive ? "live" : "demo",
    researchLevel: input.researchLevel,
    researchLevelLabel: levelMeta?.label ?? input.researchLevel,
  };
}
