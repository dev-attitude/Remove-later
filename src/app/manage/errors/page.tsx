"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { ManageStatCard } from "@/components/manage/ManageStatCard";

type ErrorsData = {
  last7: number;
  bySource: { source: string; count: number }[];
  errors: {
    id: string;
    source: string;
    message: string;
    createdAt: string;
    user: { id: string; email: string; name: string | null } | null;
  }[];
};

function fmtDateTime(value: string) {
  return new Date(value).toLocaleString("en-NA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageErrorsPage() {
  const [data, setData] = useState<ErrorsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/manage/errors")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading technical errors…</p>;

  return (
    <div>
      <ManagePageHeader
        title="Technical errors"
        description="Server errors your clients ran into — so you can assist before they even report it."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <ManageStatCard
          label="Errors (last 7 days)"
          value={data.last7}
          tone={data.last7 > 0 ? "danger" : "success"}
          hint={data.last7 === 0 ? "All quiet — no failures recorded" : "Across all services"}
        />
        <Card variant="manage">
          <CardTitle>By source (7 days)</CardTitle>
          {data.bySource.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No errors this week.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {data.bySource.map((s) => (
                <li key={s.source} className="flex justify-between">
                  <span className="text-muted">{s.source}</span>
                  <span className="font-semibold text-charcoal">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <CardTitle>Latest errors</CardTitle>
        </div>
        {data.errors.length === 0 ? (
          <p className="p-5 text-sm text-muted">
            No errors recorded yet. When a client hits a server error (AI writing, plagiarism
            checks, hosting orders, contact forms…), it will appear here with the affected user.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {data.errors.map((e) => (
              <li key={e.id} className="flex gap-3 px-5 py-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal">{e.message}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {e.source} · {fmtDateTime(e.createdAt)}
                    {e.user ? ` · ${e.user.name ?? e.user.email}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
