"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DASHBOARD_STATS_EVENT } from "@/lib/client/dashboard-stats-events";
import {
  computeStudentDashboardStats,
  formatDashboardNumber,
  STUDENT_STAT_HINTS,
} from "@/lib/client/portal-dashboard-stats";
import type { PortalId } from "@/lib/portals";

type Widget = { label: string; value: string };

type ServerStats = {
  understandingTopicsViewed: number;
  serverTopicProgressPercent: number;
  supervisorFeedbackNew: number;
};

const PLACEHOLDER_WIDGETS: Record<PortalId, Widget[]> = {
  institution: [
    { label: "Students supervised", value: "—" },
    { label: "Pending reviews", value: "—" },
    { label: "To mark", value: "—" },
    { label: "Approvals waiting", value: "—" },
  ],
  student: [],
  analysis: [
    { label: "Active datasets", value: "—" },
    { label: "Tests run", value: "—" },
    { label: "Transcription hrs", value: "—" },
    { label: "Reports exported", value: "—" },
  ],
  developer: [
    { label: "MRR", value: "—" },
    { label: "Active users", value: "—" },
    { label: "Institutions", value: "—" },
    { label: "API errors (24h)", value: "—" },
  ],
};

function buildStudentWidgets(
  local: ReturnType<typeof computeStudentDashboardStats>,
  server: ServerStats | null
): Widget[] {
  const progress = server
    ? Math.min(
        100,
        Math.max(local.researchProgressPercent, server.serverTopicProgressPercent)
      )
    : local.researchProgressPercent;

  const feedback =
    server && server.supervisorFeedbackNew > 0
      ? `${server.supervisorFeedbackNew} new`
      : "0";

  return [
    { label: "Research progress", value: `${progress}%` },
    { label: "Word count", value: formatDashboardNumber(local.wordCount) },
    { label: "Citations", value: formatDashboardNumber(local.citations) },
    { label: "Supervisor feedback", value: feedback },
  ];
}

export function PortalDashboardWidgets({ portalId }: { portalId: PortalId }) {
  const [widgets, setWidgets] = useState<Widget[]>(() =>
    portalId === "student"
      ? [
          { label: "Research progress", value: "…" },
          { label: "Word count", value: "…" },
          { label: "Citations", value: "…" },
          { label: "Supervisor feedback", value: "…" },
        ]
      : PLACEHOLDER_WIDGETS[portalId]
  );

  const serverStatsRef = useRef<ServerStats | null>(null);

  useEffect(() => {
    if (portalId !== "student") {
      setWidgets(PLACEHOLDER_WIDGETS[portalId]);
      return;
    }

    function refresh() {
      const local = computeStudentDashboardStats(portalId);
      setWidgets((prev) => {
        const next = buildStudentWidgets(local, serverStatsRef.current);
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }

    refresh();

    fetch("/api/portal/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ServerStats | null) => {
        if (data) {
          serverStatsRef.current = data;
          refresh();
        }
      })
      .catch(() => undefined);

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "gm-research-workspace-v1" ||
        e.key === "gm-understanding-viewed-v1"
      ) {
        refresh();
      }
    };
    const onStats = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(DASHBOARD_STATS_EVENT, onStats);
    window.addEventListener("focus", onStats);
    document.addEventListener("visibilitychange", onStats);
    const interval = window.setInterval(refresh, 4000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(DASHBOARD_STATS_EVENT, onStats);
      window.removeEventListener("focus", onStats);
      document.removeEventListener("visibilitychange", onStats);
      window.clearInterval(interval);
    };
  }, [portalId]);

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map((w) => (
        <Card key={w.label} className="!p-4">
          <p className="text-xs text-slate-500">{w.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{w.value}</p>
          {portalId === "student" && STUDENT_STAT_HINTS[w.label] && (
            <p className="mt-1 text-xs text-slate-500">{STUDENT_STAT_HINTS[w.label]}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
