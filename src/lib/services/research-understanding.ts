import { generateAcademicText } from "@/lib/services/ai";
import { RESEARCH_LEVELS } from "@/lib/research-levels";

export const UNDERSTANDING_ACTIONS = [
  { id: "study-guide", label: "Academic study guide" },
  { id: "key-concepts", label: "Key concepts & definitions" },
  { id: "methodology", label: "Methodology explained" },
  { id: "statistics", label: "Statistics simplified" },
  { id: "critical-review", label: "Critical review (strengths & gaps)" },
  { id: "exam-prep", label: "Exam preparation notes" },
  { id: "quiz", label: "Practice quiz with answers" },
  { id: "flashcards", label: "Flashcards" },
  { id: "first-year", label: "Explain like first-year student" },
  { id: "thesis-link", label: "Link to my research / thesis" },
] as const;

export type UnderstandingActionId = (typeof UNDERSTANDING_ACTIONS)[number]["id"];

export type UnderstandingInput = {
  mode: "topic" | "document";
  action: UnderstandingActionId;
  researchLevel: string;
  field?: string;
  topic?: string;
  documentText?: string;
  fileName?: string;
};

const MAX_DOC_CHARS = 14_000;

function levelGuidance(researchLevel: string): string {
  const level = RESEARCH_LEVELS.find((l) => l.id === researchLevel);
  return level?.writingGuidance ?? RESEARCH_LEVELS[0].writingGuidance;
}

function levelLabel(researchLevel: string): string {
  return RESEARCH_LEVELS.find((l) => l.id === researchLevel)?.label ?? "Bachelor's";
}

function actionInstructions(action: UnderstandingActionId, mode: "topic" | "document"): string {
  const doc = mode === "document";
  const map: Record<UnderstandingActionId, string> = {
    "study-guide": doc
      ? "Produce a structured academic report on the uploaded article: title (inferred), authors if visible, purpose, methods, findings, implications, and 5 takeaway points for a student."
      : "Create a comprehensive academic study guide on this topic: core ideas, how scholars approach it, essential terminology, and what a student should master for coursework or exams.",
    "key-concepts": doc
      ? "List and define the most important concepts, theories, and variables in this article. Explain how they relate to each other."
      : "Define the key concepts, theories, and debates in this field. Use academically accurate but student-friendly language.",
    methodology: doc
      ? "Explain the research design, sampling, data collection, and analysis used in this article. Note limitations and what type of evidence it provides."
      : "Describe typical research methodologies used to study this topic (designs, samples, instruments). Suggest what a student at this level could realistically use.",
    statistics: doc
      ? "Explain any statistical or quantitative results in plain language. Define tests, effect sizes, or tables mentioned and what they mean for conclusions."
      : "Explain common statistical approaches used in this area and how to interpret typical results (without fabricating data from a specific paper).",
    "critical-review": doc
      ? "Write a critical academic review: strengths, weaknesses, gaps, bias risks, and how this article fits the wider literature."
      : "Discuss major debates, limitations in current knowledge, and open questions students should be aware of when researching this topic.",
    "exam-prep": doc
      ? "Create exam-focused revision notes from this article: likely questions, model answer outlines, and memory hooks."
      : "Create exam-focused revision material: likely questions, bullet-point answers, and priority topics to revise.",
    quiz: doc
      ? "Generate 10 exam-style questions with detailed model answers based only on the uploaded article."
      : "Generate 10 exam-style questions with model answers to test understanding of this topic at the specified level.",
    flashcards: doc
      ? "Create 15 flashcards (term → definition/explanation) drawn from the article content."
      : "Create 15 flashcards (term → definition) for essential vocabulary and ideas in this topic.",
    "first-year": doc
      ? "Explain the article's main message in simple language suitable for a first-year university student. Avoid jargon or define it clearly."
      : "Explain this topic in simple language suitable for a first-year student. Use examples and short paragraphs.",
    "thesis-link": doc
      ? "Explain how a student could use this article in a thesis or dissertation: where it fits (lit review, methods, discussion), citation angles, and cautions."
      : "Suggest how a student at this level could turn this topic into a feasible research project: narrow questions, methods, and ethical considerations.",
  };
  return map[action];
}

function buildTopicPrompt(input: UnderstandingInput): string {
  const topic = input.topic?.trim() || "general academic research skills";
  const field = input.field?.trim() ? `Field/discipline: ${input.field.trim()}\n` : "";
  return `${field}Research level: ${levelLabel(input.researchLevel)}
Topic or subject: ${topic}

${levelGuidance(input.researchLevel)}

Task: ${actionInstructions(input.action, "topic")}

Format with clear markdown headings (##). Be practical for students — accurate, structured, and usable for assignments or exams. Do not invent specific paper titles or DOIs.`;
}

function buildDocumentPrompt(input: UnderstandingInput): string {
  const text = (input.documentText || "").trim().slice(0, MAX_DOC_CHARS);
  const name = input.fileName?.trim() || "Uploaded article";
  const field = input.field?.trim() ? `Student field: ${input.field.trim()}\n` : "";
  const topicHint = input.topic?.trim()
    ? `Student research focus: ${input.topic.trim()}\n`
    : "";

  return `${field}${topicHint}Research level: ${levelLabel(input.researchLevel)}
Document: ${name}

${levelGuidance(input.researchLevel)}

Task: ${actionInstructions(input.action, "document")}

Base your analysis ONLY on the document text below. If something is missing, say so instead of inventing content.

--- DOCUMENT TEXT ---
${text}
--- END ---

Format as a clear academic report with markdown headings (##). Include a short "Report summary" at the top (3–5 bullets).`;
}

export async function runResearchUnderstanding(input: UnderstandingInput) {
  if (input.mode === "document") {
    if (!input.documentText?.trim()) {
      throw new Error("No document text to analyze. Upload a file or paste the article text.");
    }
    if (input.documentText.trim().length < 80) {
      throw new Error("Document text is too short. Add more content or upload a fuller article.");
    }
  } else if (!input.topic?.trim()) {
    throw new Error("Enter a topic or subject to study.");
  }

  const prompt =
    input.mode === "document" ? buildDocumentPrompt(input) : buildTopicPrompt(input);

  const maxTokens =
    input.action === "quiz" || input.action === "flashcards" ? 2500 : 2200;

  const result = await generateAcademicText(prompt, { maxTokens });

  return {
    content: result.content,
    mode: result.mode,
    modeLabel: input.mode === "document" ? "Article analysis" : "Topic study",
    actionLabel:
      UNDERSTANDING_ACTIONS.find((a) => a.id === input.action)?.label ?? input.action,
    sourceLabel:
      input.mode === "document"
        ? input.fileName || "Pasted text"
        : input.topic?.trim() || "Topic",
  };
}
