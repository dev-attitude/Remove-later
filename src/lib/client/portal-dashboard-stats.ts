import type { AcademicWritingResult, TopicGenerationResult } from "@/lib/client/api";
import { countCitationLookups } from "@/lib/client/citation-lookups";
import {
  countViewedUnderstandingTopics,
  sumViewedUnderstandingReferences,
} from "@/lib/client/understanding-progress";
import { listWorkspaceItemsForPortal } from "@/lib/client/workspace-storage";
import { getUnderstandingTopicCount } from "@/lib/research-suite/understanding-topics";
import { getModulesForPortal, type PortalId } from "@/lib/portals";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function wordsFromUnknownResult(result: unknown): number {
  if (!result || typeof result !== "object") return 0;
  const r = result as Record<string, unknown>;
  let total = 0;
  if (typeof r.content === "string") total += countWords(r.content);
  if (typeof r.output === "string") total += countWords(r.output);
  if (typeof r.fullText === "string") total += countWords(r.fullText);
  if (typeof r.text === "string") total += countWords(r.text);
  return total;
}

function writingWordCount(items: ReturnType<typeof listWorkspaceItemsForPortal>): number {
  let total = 0;
  for (const item of items) {
    if (item.moduleId === "writing") {
      const result = item.result as AcademicWritingResult | null;
      if (result?.content) total += countWords(result.content);
      const draft = item.form.toolDraft;
      if (typeof draft === "string" && draft.trim()) total += countWords(draft);
      continue;
    }
    if (
      item.moduleId === "proposals" ||
      item.moduleId === "presentations" ||
      item.moduleId === "ai-detection"
    ) {
      total += wordsFromUnknownResult(item.result);
    }
    if (typeof item.form.text === "string" && item.form.text.trim()) {
      total += countWords(item.form.text);
    }
    if (typeof item.form.draft === "string" && item.form.draft.trim()) {
      total += countWords(item.form.draft);
    }
  }
  return total;
}

function literatureReferenceCount(
  items: ReturnType<typeof listWorkspaceItemsForPortal>
): number {
  let total = 0;
  for (const item of items) {
    if (item.moduleId !== "literature") continue;
    const result = item.result as { papers?: unknown[]; results?: unknown[] } | null;
    if (Array.isArray(result?.papers)) total += result.papers.length;
    if (Array.isArray(result?.results)) total += result.results.length;
  }
  return total;
}

function researchTopicsCitationCount(
  items: ReturnType<typeof listWorkspaceItemsForPortal>
): number {
  let total = 0;
  for (const item of items) {
    if (item.moduleId !== "research-topics") continue;
    const result = item.result as TopicGenerationResult | null;
    if (!result?.topics) continue;
    for (const t of result.topics) {
      if (Array.isArray(t.articles)) total += t.articles.length;
    }
  }
  return total;
}

export type StudentDashboardStats = {
  researchProgressPercent: number;
  wordCount: number;
  citations: number;
  toolsUsed: number;
};

export function computeStudentDashboardStats(portalId: PortalId): StudentDashboardStats {
  const items = listWorkspaceItemsForPortal(portalId);
  const totalTopics = getUnderstandingTopicCount();
  const viewedTopics = countViewedUnderstandingTopics();
  const topicPct =
    totalTopics > 0 ? Math.round((viewedTopics / totalTopics) * 100) : 0;

  const trackableModules = getModulesForPortal(portalId).filter(
    (m) => m.id !== "how-it-works"
  );
  const modulesUsed = new Set(items.map((i) => i.moduleId)).size;
  const modulePct =
    trackableModules.length > 0
      ? Math.round((modulesUsed / trackableModules.length) * 100)
      : 0;

  const researchProgressPercent = Math.min(
    100,
    Math.round(topicPct * 0.65 + modulePct * 0.35)
  );

  return {
    researchProgressPercent,
    wordCount: writingWordCount(items),
    citations:
      sumViewedUnderstandingReferences() +
      literatureReferenceCount(items) +
      researchTopicsCitationCount(items) +
      countCitationLookups(),
    toolsUsed: modulesUsed,
  };
}

export function formatDashboardNumber(n: number): string {
  return n.toLocaleString("en-NA");
}

export const STUDENT_STAT_HINTS: Record<string, string> = {
  "Research progress": "Topics opened in Research Understanding and tools you’ve used",
  "Word count": "Words from AI Writing, proposals, and saved drafts in this browser",
  Citations:
    "References from Understanding topics, Literature Review, Topic Generator, and DOI lookups",
  "Supervisor feedback":
    "Supervisor document reviews uploaded in Supervisor & Collaboration",
};
