"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/manage/StatusPill";
import {
  CLIENT_STATUSES,
  ENGAGEMENT_STATUSES,
  clientStatusLabel,
  engagementStatusLabel,
  formatNad,
  getPackageOptions,
  getServiceOptions,
  serviceLabel,
} from "@/lib/business-manage";

export default function ManageClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEngagement, setShowEngagement] = useState(false);
  const [engForm, setEngForm] = useState({
    title: "",
    serviceSlug: "business-consulting",
    packageId: "",
    status: "inquiry",
    quotedAmount: "",
    notes: "",
    tasks: "",
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/manage/clients/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setClient(data.client);
  }, [id]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function createEngagement(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/manage/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          title: engForm.title,
          serviceSlug: engForm.serviceSlug,
          packageId: engForm.packageId || undefined,
          status: engForm.status,
          quotedAmount: engForm.quotedAmount ? Number(engForm.quotedAmount) : undefined,
          notes: engForm.notes,
          tasks: engForm.tasks
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowEngagement(false);
      setEngForm({
        title: "",
        serviceSlug: "business-consulting",
        packageId: "",
        status: "inquiry",
        quotedAmount: "",
        notes: "",
        tasks: "",
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  if (error && !client) return <p className="text-red-600">{error}</p>;
  if (!client) return <p className="text-slate-500">Loading…</p>;

  const packages = getPackageOptions();
  const services = getServiceOptions();

  return (
    <div>
      <Link href="/manage/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{client.name}</h1>
          {client.company && <p className="text-slate-600">{client.company}</p>}
          <div className="mt-2">
            <StatusPill status={client.status} label={clientStatusLabel(client.status)} />
          </div>
        </div>
        <Button type="button" onClick={() => setShowEngagement(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New service
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Email</p>
          <p className="mt-1 text-sm">{client.email || "—"}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Phone</p>
          <p className="mt-1 text-sm">{client.phone || "—"}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Location</p>
          <p className="mt-1 text-sm">{client.location || "—"}</p>
        </Card>
      </div>

      {client.notes && (
        <Card className="mb-6">
          <CardTitle>Notes</CardTitle>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{client.notes}</p>
        </Card>
      )}

      {showEngagement && (
        <Card className="mb-6">
          <CardTitle>New service for {client.name}</CardTitle>
          <form onSubmit={createEngagement} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Service title *"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={engForm.title}
              onChange={(e) => setEngForm({ ...engForm, title: e.target.value })}
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={engForm.serviceSlug}
              onChange={(e) => setEngForm({ ...engForm, serviceSlug: e.target.value })}
            >
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={engForm.packageId}
              onChange={(e) => setEngForm({ ...engForm, packageId: e.target.value })}
            >
              <option value="">No fixed package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.group}: {p.name} (N$ {p.price})
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={engForm.status}
              onChange={(e) => setEngForm({ ...engForm, status: e.target.value })}
            >
              {ENGAGEMENT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Quoted amount (NAD)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={engForm.quotedAmount}
              onChange={(e) => setEngForm({ ...engForm, quotedAmount: e.target.value })}
            />
            <textarea
              placeholder="Progress checklist (one task per line)"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              value={engForm.tasks}
              onChange={(e) => setEngForm({ ...engForm, tasks: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={engForm.notes}
              onChange={(e) => setEngForm({ ...engForm, notes: e.target.value })}
            />
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">Create service</Button>
              <Button type="button" variant="secondary" onClick={() => setShowEngagement(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardTitle>Services & progress</CardTitle>
        {client.engagements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No services yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {client.engagements.map((e: any) => (
              <li key={e.id}>
                <Link
                  href={`/manage/services/${e.id}`}
                  className="block rounded-lg border border-slate-200 p-4 hover:border-brand-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{e.title}</p>
                    <StatusPill status={e.status} label={engagementStatusLabel(e.status)} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{serviceLabel(e.serviceSlug)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${e.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs">{e.progressPercent}%</span>
                  </div>
                  {e.quotedAmount != null && (
                    <p className="mt-2 text-xs text-slate-600">
                      Quoted {formatNad(e.quotedAmount)} · Paid {formatNad(e.paidAmount)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
