export const DASHBOARD_STATS_EVENT = "gm-dashboard-stats-changed";

export function notifyDashboardStatsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_STATS_EVENT));
}
