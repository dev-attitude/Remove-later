"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/manage/StatusPill";
import {
  ENGAGEMENT_STATUSES,
  engagementStatusLabel,
  formatNad,
  serviceLabel,
} from "@/lib/business-manage";

export default function ManageServicesPage() {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/manage/engagements?${params}`)
      .then((r) => r.json())
      .then((d) => setEngagements(d.engagements ?? []));
  }, [statusFilter]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Services & progress</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">
        Track every client service — registration, IT, student assistance, websites & more.
      </p>

      <select
        className="mb-4 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All statuses</option>
        {ENGAGEMENT_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="space-y-3">
        {engagements.map((e) => (
          <Link key={e.id} href={`/manage/services/${e.id}`}>
            <Card className="transition hover:border-brand-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{e.title}</p>
                  <p className="text-sm text-slate-600">
                    {e.client.name}
                    {e.client.company ? ` · ${e.client.company}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{serviceLabel(e.serviceSlug)}</p>
                </div>
                <StatusPill status={e.status} label={engagementStatusLabel(e.status)} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${e.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{e.progressPercent}%</span>
              </div>
              {e.quotedAmount != null && (
                <p className="mt-2 text-xs text-slate-600">
                  {formatNad(e.paidAmount)} / {formatNad(e.quotedAmount)} paid
                </p>
              )}
            </Card>
          </Link>
        ))}
        {engagements.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">No services yet. Create one from a client profile.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
