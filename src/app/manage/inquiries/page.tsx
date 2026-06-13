"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { ManageStatCard } from "@/components/manage/ManageStatCard";
import { StatusPill } from "@/components/manage/StatusPill";

type Inquiry = {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  packageId: string | null;
  packageName: string | null;
  message: string | null;
  itemsJson: string | null;
  totalNad: number | null;
  orderRef: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

type Data = {
  inquiries: Inquiry[];
  summary: {
    byStatus: Record<string, number>;
    byKind: Record<string, number>;
  };
};

const KIND_LABELS: Record<string, string> = {
  hosting_order: "Hosting order",
  purchase: "Shop / service purchase",
  contact: "Contact / inquiry",
  refund_request: "Refund request",
};

const KIND_FILTERS = [
  { id: "all", label: "All" },
  { id: "refund_request", label: "Refunds" },
  { id: "hosting_order", label: "Hosting" },
  { id: "purchase", label: "Shop & IT services" },
  { id: "contact", label: "Contact" },
];

function fmtDateTime(value: string) {
  return new Date(value).toLocaleString("en-NA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseItems(json: string | null): { name: string; price: number }[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export default function ManageInquiriesPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  function load() {
    fetch("/api/manage/inquiries")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function setStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/manage/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading orders & inquiries…</p>;

  const filtered =
    kindFilter === "all"
      ? data.inquiries
      : data.inquiries.filter((i) => i.kind === kindFilter);

  return (
    <div>
      <ManagePageHeader
        title="Orders & inquiries"
        description="Everything clients submit across hosting, the shop, IT services, and contact forms — in one inbox."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <ManageStatCard
          label="New (needs attention)"
          value={data.summary.byStatus.new ?? 0}
          tone="warning"
        />
        <ManageStatCard
          label="In progress"
          value={data.summary.byStatus.in_progress ?? 0}
        />
        <ManageStatCard
          label="Resolved"
          value={data.summary.byStatus.resolved ?? 0}
          tone="success"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setKindFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              kindFilter === f.id
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
            {f.id !== "all" && ` (${data.summary.byKind[f.id] ?? 0})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            No inquiries here yet. New hosting orders, shop purchases, and contact requests will
            appear automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => {
            const items = parseItems(inq.itemsJson);
            const open = openId === inq.id;
            return (
              <Card key={inq.id} className="!p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : inq.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{inq.name}</p>
                      <StatusPill status={inq.status} label={inq.status.replace("_", " ")} />
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {KIND_LABELS[inq.kind] ?? inq.kind}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {inq.email}
                      {inq.phone ? ` · ${inq.phone}` : ""}
                      {inq.packageName ? ` · ${inq.packageName}` : ""}
                      {inq.orderRef ? ` · ${inq.orderRef}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {inq.totalNad != null && inq.totalNad > 0 && (
                      <p className="text-sm font-bold text-slate-900">
                        N${inq.totalNad.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">{fmtDateTime(inq.createdAt)}</p>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    {inq.subject && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Subject:</span> {inq.subject}
                      </p>
                    )}
                    {inq.message && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                        {inq.message}
                      </p>
                    )}
                    {items.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-slate-700">
                        {items.map((it, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{it.name}</span>
                            <span className="font-medium">N${it.price.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {inq.status !== "in_progress" && (
                        <button
                          type="button"
                          onClick={() => setStatus(inq.id, "in_progress")}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                        >
                          Mark in progress
                        </button>
                      )}
                      {inq.status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => setStatus(inq.id, "resolved")}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Mark resolved
                        </button>
                      )}
                      {inq.status !== "new" && (
                        <button
                          type="button"
                          onClick={() => setStatus(inq.id, "new")}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Reopen
                        </button>
                      )}
                      <a
                        href={`mailto:${inq.email}`}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Email client
                      </a>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
