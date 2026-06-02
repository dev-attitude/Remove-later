/**
 * Legacy AI analysis for Research Understanding API.
 * The Understanding module UI uses topic links + live search only.
 */
import { generateAcademicText } from "@/lib/services/ai";
import { RESEARCH_LEVELS } from "@/lib/research-levels";

export {
  UNDERSTANDING_RESEARCH_TOPICS,
  getUnderstandingTopicOptions,
  type UnderstandingTopic,
} from "@/lib/research-suite/understanding-topics";

export const UNDERSTANDING_ACTIONS = [
  { id: "study-guide", label: "Academic study guide" },
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

function buildTopicPrompt(input: UnderstandingInput): string {
  const topic = input.topic?.trim() || "Research methods fundamentals";
  const field = input.field?.trim() ? `Field/discipline: ${input.field.trim()}\n` : "";
  return `${field}Research level: ${levelLabel(input.researchLevel)}
Topic: ${topic}

${levelGuidance(input.researchLevel)}

Create a concise academic study guide for students. Use markdown headings (##).`;
}

function buildDocumentPrompt(input: UnderstandingInput): string {
  const text = (input.documentText || "").trim().slice(0, MAX_DOC_CHARS);
  const name = input.fileName?.trim() || "Uploaded article";
  return `Research level: ${levelLabel(input.researchLevel)}
Document: ${name}

Summarize this article for a student. Base analysis ONLY on the text below.

--- DOCUMENT TEXT ---
${text}
--- END ---`;
}

export async function runResearchUnderstanding(input: UnderstandingInput) {
  if (input.mode === "document") {
    if (!input.documentText?.trim() || input.documentText.trim().length < 80) {
      throw new Error("Upload or paste a fuller article to analyze.");
    }
  }

  const prompt =
    input.mode === "document" ? buildDocumentPrompt(input) : buildTopicPrompt(input);
  const result = await generateAcademicText(prompt, { maxTokens: 2200 });

  return {
    content: result.content,
    mode: result.mode,
    modeLabel: input.mode === "document" ? "Article analysis" : "Topic study",
    actionLabel: "Study guide",
    sourceLabel: input.mode === "document" ? input.fileName || "Article" : input.topic || "Topic",
  };
}
