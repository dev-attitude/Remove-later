"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  computeStudentDashboardStats,
  formatDashboardNumber,
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
      : "None yet";

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
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(refresh, 8000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [portalId]);

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map((w) => (
        <Card key={w.label} className="!p-4">
          <p className="text-xs text-slate-500">{w.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{w.value}</p>
          {portalId === "student" && w.label === "Research progress" && (
            <p className="mt-1 text-xs text-slate-500">
              Based on topics you open and tools you use
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
