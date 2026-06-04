import { notifyDashboardStatsChanged } from "@/lib/client/dashboard-stats-events";

const STORAGE_KEY = "gm-understanding-viewed-v1";

export type ViewedUnderstandingTopic = {
  module: string;
  label: string;
  referenceCount: number;
  viewedAt: number;
};

function topicKey(module: string, label: string) {
  return `${module}::${label}`;
}

function readViewed(): ViewedUnderstandingTopic[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ViewedUnderstandingTopic[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeViewed(items: ViewedUnderstandingTopic[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 500)));
  } catch {
    /* ignore quota */
  }
}

export function markUnderstandingTopicViewed(
  module: string,
  label: string,
  referenceCount = 0
) {
  const key = topicKey(module, label);
  const items = readViewed();
  const idx = items.findIndex((t) => topicKey(t.module, t.label) === key);
  const entry: ViewedUnderstandingTopic = {
    module,
    label,
    referenceCount: Math.max(0, referenceCount),
    viewedAt: Date.now(),
  };
  if (idx >= 0) items[idx] = entry;
  else items.unshift(entry);
  writeViewed(items);
  notifyDashboardStatsChanged();
}

export function getViewedUnderstandingTopics(): ViewedUnderstandingTopic[] {
  return readViewed();
}

export function countViewedUnderstandingTopics(): number {
  return readViewed().length;
}

export function sumViewedUnderstandingReferences(): number {
  return readViewed().reduce((n, t) => n + t.referenceCount, 0);
}
