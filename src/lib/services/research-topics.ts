import OpenAI from "openai";
import { config, getRuntimeMode } from "@/lib/config";
import { multiSourceSearch } from "@/lib/integrations/search";
import type { UnifiedPaper } from "@/lib/integrations/types";
import { RESEARCH_METHODS } from "@/lib/research-methods";

export { RESEARCH_METHODS };

export type TopicGenerationInput = {
  fieldOfStudy: string;
  problems: string;
  researchLocation: string;
  researchMethod: string;
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
  return `You are an academic supervisor helping a student choose a thesis/dissertation topic.

Student profile:
- Field of study: ${input.fieldOfStudy}
- Problems observed or to address: ${input.problems}
- Research location / context: ${input.researchLocation}
- Preferred research method: ${input.researchMethod}

Generate exactly 3 DISTINCT, high-quality research topics. Each must:
- Be feasible in the stated location using the chosen method
- Address different angles of the stated problems (not three rephrasings of the same idea)
- Use formal academic English
- Include 2-3 focused research questions per topic

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

  return [
    {
      id: "topic-1",
      title: `${field}: Community-level drivers of the problems described in ${loc}`,
      rationale: `This topic directly examines local factors behind the issues you raised, using ${method} within ${loc}. It allows policy-relevant findings while staying within your discipline.`,
      researchQuestions: [
        `What are the primary factors associated with the stated problems in ${loc}?`,
        `How do stakeholders perceive barriers and enablers to addressing these problems?`,
      ],
      alignmentNote: `Aligned with ${method} and feasible data collection in ${loc}.`,
    },
    {
      id: "topic-2",
      title: `Evaluating interventions and service delivery for ${field.toLowerCase()} challenges in ${loc}`,
      rationale: `Focuses on what is being done today and whether approaches work, suitable for applied research in your field at the chosen site.`,
      researchQuestions: [
        `To what extent do current interventions address the problems you identified?`,
        `What improvements do practitioners and beneficiaries recommend?`,
      ],
      alignmentNote: `Supports comparative or evaluative designs consistent with ${method}.`,
    },
    {
      id: "topic-3",
      title: `Long-term outcomes and equity in ${field} research conducted in ${loc}`,
      rationale: `Explores sustainability, inclusion, and gaps in existing scholarship—ideal if you want a topic with clear literature contribution.`,
      researchQuestions: [
        `What does existing evidence say about outcomes related to your problem statement in similar contexts?`,
        `Which population groups are under-represented in local research and practice?`,
      ],
      alignmentNote: `Works well with ${method}; emphasizes gap identification before primary data collection.`,
    },
  ];
}

function mockArticles(topic: GeneratedTopic, input: TopicGenerationInput): UnifiedPaper[] {
  const base = topic.title.slice(0, 60);
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
    abstract: `Related work on ${input.fieldOfStudy} using methods comparable to ${input.researchMethod}.`,
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

  const result = await multiSourceSearch(query, ["openalex", "semantic-scholar"]);
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

  return {
    topics: topicsWithArticles,
    mode: useLive ? "live" : "demo",
  };
}
