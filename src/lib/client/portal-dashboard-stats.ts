import type { AcademicWritingResult } from "@/lib/client/api";
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

function writingWordCount(items: ReturnType<typeof listWorkspaceItemsForPortal>): number {
  let total = 0;
  for (const item of items) {
    if (item.moduleId !== "writing") continue;
    const result = item.result as AcademicWritingResult | null;
    if (result?.content) total += countWords(result.content);
    const draft = item.form.toolDraft;
    if (typeof draft === "string" && draft.trim()) total += countWords(draft);
  }
  return total;
}

function literatureReferenceCount(
  items: ReturnType<typeof listWorkspaceItemsForPortal>
): number {
  let total = 0;
  for (const item of items) {
    if (item.moduleId !== "literature") continue;
    const result = item.result as { papers?: unknown[] } | null;
    if (Array.isArray(result?.papers)) total += result.papers.length;
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
      sumViewedUnderstandingReferences() + literatureReferenceCount(items),
    toolsUsed: modulesUsed,
  };
}

export function formatDashboardNumber(n: number): string {
  return n.toLocaleString("en-NA");
}
