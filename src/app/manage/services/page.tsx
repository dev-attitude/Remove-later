"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/manage/StatusPill";
import { getEngagementStepStatus } from "@/lib/registration-workflows";
import {
  ENGAGEMENT_STATUSES,
  engagementStatusLabel,
  formatNad,
  serviceLabel,
} from "@/lib/business-manage";

type StaleInfo = {
  engagementId: string;
  daysSinceUpdate: number;
  canSendReminder: boolean;
};

export default function ManageServicesPage() {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [staleMap, setStaleMap] = useState<Map<string, StaleInfo>>(new Map());
  const [staleCount, setStaleCount] = useState(0);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const loadStale = useCallback(() => {
    fetch("/api/manage/registration-reminders")
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, StaleInfo>();
        for (const s of d.stale ?? []) {
          map.set(s.engagementId, {
            engagementId: s.engagementId,
            daysSinceUpdate: s.daysSinceUpdate,
            canSendReminder: s.canSendReminder,
          });
        }
        setStaleMap(map);
        setStaleCount(d.count ?? 0);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/manage/engagements?${params}`)
      .then((r) => r.json())
      .then((d) => setEngagements(d.engagements ?? []));
    loadStale();
  }, [statusFilter, loadStale]);

  async function sendAllReminders() {
    setSendingReminders(true);
    setReminderMessage(null);
    try {
      const res = await fetch("/api/manage/registration-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const r = data.result;
      setReminderMessage(
        `Reminders sent to ${r.sent} client(s). ${r.skipped} skipped (already reminded recently). Admin digest ${r.adminDigestSent ? "sent" : "not sent"}.`
      );
      loadStale();
    } catch (e) {
      setReminderMessage(e instanceof Error ? e.message : "Reminder failed");
    } finally {
      setSendingReminders(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Services & progress</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">
        Track every client service — registration, IT, student assistance, websites & more.
        Registrations with no step update in 3+ days receive automatic client reminders.
      </p>

      {staleCount > 0 && (
        <Card className="mb-6 !border-amber-200 !bg-amber-50/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">
                  {staleCount} registration{staleCount === 1 ? "" : "s"} with no update in 3+ days
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Clients can be reminded automatically. You will also receive a summary email at
                  your business inbox when reminders run.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={sendAllReminders}
              disabled={sendingReminders}
              className="shrink-0"
            >
              <Bell className="mr-2 h-4 w-4" />
              {sendingReminders ? "Sending…" : "Send reminders now"}
            </Button>
          </div>
          {reminderMessage && (
            <p className="mt-3 text-sm text-amber-900">{reminderMessage}</p>
          )}
        </Card>
      )}

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
        {engagements.map((e) => {
          const stale = staleMap.get(e.id);
          return (
            <Link key={e.id} href={`/manage/services/${e.id}`}>
              <Card
                className={`transition hover:border-brand-200 ${
                  stale ? "border-amber-200 bg-amber-50/30" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{e.title}</p>
                    <p className="text-sm text-slate-600">
                      {e.client.name}
                      {e.client.company ? ` · ${e.client.company}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{serviceLabel(e.serviceSlug)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {stale && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        <Mail className="h-3 w-3" />
                        {stale.daysSinceUpdate}d no update
                      </span>
                    )}
                    <StatusPill status={e.status} label={engagementStatusLabel(e.status)} />
                  </div>
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
                {(() => {
                  const stepStatus = getEngagementStepStatus(e.packageId, e.tasks ?? []);
                  if (!stepStatus?.current) return null;
                  return (
                    <p className="mt-2 rounded-md bg-brand-50 px-2 py-1.5 text-xs font-medium text-brand-800">
                      Current step: {stepStatus.current.title}
                    </p>
                  );
                })()}
              </Card>
            </Link>
          );
        })}
        {engagements.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">No services yet. Create one from a client profile.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
