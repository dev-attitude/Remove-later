"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/manage/StatusPill";
import { CLIENT_STATUSES, clientStatusLabel } from "@/lib/business-manage";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  _count: { engagements: number; income: number };
  engagements: Array<{ id: string; title: string; status: string; progressPercent: number }>;
};

export default function ManageClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    status: "active",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/manage/clients?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClients(data.clients);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/manage/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", company: "", location: "", status: "active", notes: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage all Skyrapay clients — registrations, IT, student assistance & more.
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Add client
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardTitle>New client</CardTitle>
          <form onSubmit={createClient} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full name *"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Company / organisation"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Phone"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Location (town / region)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Notes"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">Save client</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
            placeholder="Search name, email, company…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {CLIENT_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : clients.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No clients found. Add your first client above.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clients.map((c) => (
            <Link key={c.id} href={`/manage/clients/${c.id}`}>
              <Card className="h-full transition hover:border-brand-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    {c.company && <p className="text-sm text-slate-600">{c.company}</p>}
                  </div>
                  <StatusPill status={c.status} label={clientStatusLabel(c.status)} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {[c.email, c.phone].filter(Boolean).join(" · ") || "No contact details"}
                </p>
                <p className="mt-3 text-xs font-medium text-slate-600">
                  {c._count.engagements} service(s) · {c._count.income} payment(s)
                </p>
                {c.engagements[0] && (
                  <p className="mt-1 text-xs text-brand-700">
                    Latest: {c.engagements[0].title} ({c.engagements[0].progressPercent}%)
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
