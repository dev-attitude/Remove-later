"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";

type UsageData = {
  total: number;
  last30: number;
  byAction: { action: string; count: number }[];
  byPortal: { portal: string; count: number }[];
  topUsers: {
    count: number;
    user: { id: string; email: string; name: string | null; portal: string } | null;
  }[];
  recent: {
    id: string;
    action: string;
    portal: string | null;
    mode: string;
    createdAt: string;
    user: { email: string; name: string | null } | null;
  }[];
};

const ACTION_LABELS: Record<string, string> = {
  "research.understanding": "Topic guides opened",
  "research.topics": "Topic ideas generated",
  "research.curriculum": "Curriculum lookups",
  "ai.writing": "AI writing runs",
  "ai.generate": "AI generations",
  "supervisor.feedback": "Supervisor feedback",
};

function fmtDateTime(value: string) {
  return new Date(value).toLocaleString("en-NA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageUsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/manage/usage")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading usage analytics…</p>;

  const maxAction = Math.max(1, ...data.byAction.map((a) => a.count));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Usage analytics
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          How your clients are using the Research App — live from the activity log.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Actions (last 30 days)</p>
          <p className="mt-2 text-2xl font-bold text-brand-700">{data.last30}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Actions (all time)</p>
          <p className="mt-2 text-2xl font-bold">{data.total}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Feature usage</CardTitle>
          {data.byAction.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No activity logged yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.byAction.map((a) => (
                <li key={a.action}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {ACTION_LABELS[a.action] ?? a.action}
                    </span>
                    <span className="font-semibold text-slate-900">{a.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${Math.round((a.count / maxAction) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Most active users (30 days)</CardTitle>
          {data.topUsers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No signed-in activity yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {data.topUsers.map((t, i) => (
                <li key={t.user?.id ?? i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t.user?.name ?? t.user?.email ?? "Unknown user"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.user?.email}
                      {t.user?.portal ? ` · ${t.user.portal}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand-700">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 !p-0 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <CardTitle>Recent activity</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Portal</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-600">{fmtDateTime(log.createdAt)}</td>
                  <td className="px-4 py-2.5 text-slate-900">
                    {log.user?.name ?? log.user?.email ?? "Anonymous"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{log.portal ?? "—"}</td>
                </tr>
              ))}
              {data.recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
