import { notifyDashboardStatsChanged } from "@/lib/client/dashboard-stats-events";

const STORAGE_KEY = "gm-citation-lookups-v1";

export function recordCitationLookup() {
  if (typeof window === "undefined") return;
  try {
    const n = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    localStorage.setItem(STORAGE_KEY, String((Number.isFinite(n) ? n : 0) + 1));
  } catch {
    /* ignore */
  }
  notifyDashboardStatsChanged();
}

export function countCitationLookups(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
