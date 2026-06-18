"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { StatusPill } from "@/components/manage/StatusPill";
import {
  CLIENT_CATEGORIES,
  CLIENT_STATUSES,
  clientCategoryLabel,
  clientStatusLabel,
} from "@/lib/business-manage";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  category: string;
  _count: { engagements: number; income: number };
  engagements: Array<{ id: string; title: string; status: string; progressPercent: number }>;
};

export default function ManageClientsPage() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(
    () => searchParams.get("category") ?? ""
  );
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
    category: "general",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
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
  }, [q, statusFilter, categoryFilter]);

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl) setCategoryFilter(fromUrl);
  }, [searchParams]);

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
      setForm({ name: "", email: "", phone: "", company: "", location: "", status: "active", category: "general", notes: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <div>
      <ManagePageHeader
        title="Clients"
        description="Manage all Skyrapay clients — registrations, IT, student assistance & more."
        actions={
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            Add client
          </Button>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <Card variant="manage" className="mb-6">
          <CardTitle>New client</CardTitle>
          <form onSubmit={createClient} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full name *"
              className="manage-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Company / organisation"
              className="manage-input"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="manage-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Phone"
              className="manage-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Location (town / region)"
              className="manage-input"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <select
              className="manage-input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="manage-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CLIENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Notes"
              className="sm:col-span-2 rounded-lg border border-line px-3 py-2 text-sm"
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

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter("")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            categoryFilter === ""
              ? "bg-brand-600 text-offwhite"
              : "bg-line text-muted hover:bg-line"
          }`}
        >
          All categories
        </button>
        {CLIENT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === c.id ? "" : c.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              categoryFilter === c.id
                ? "bg-brand-600 text-offwhite"
                : "bg-line text-muted hover:bg-line"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="manage-input py-2 pl-9"
            placeholder="Search name, email, company…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="manage-input w-auto"
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
        <p className="text-sm text-muted">Loading…</p>
      ) : clients.length === 0 ? (
        <Card variant="manage">
          <p className="text-sm text-muted">No clients found. Add your first client above.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {CLIENT_CATEGORIES.filter((cat) =>
            clients.some((c) => c.category === cat.id)
          ).map((cat) => {
            const group = clients.filter((c) => c.category === cat.id);
            return (
              <section key={cat.id}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  {cat.label}
                  <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-bold text-muted">
                    {group.length}
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.map((c) => (
                    <Link key={c.id} href={`/manage/clients/${c.id}`}>
                      <Card className="h-full transition hover:border-brand-200 hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-charcoal">{c.name}</p>
                            {c.company && <p className="text-sm text-muted">{c.company}</p>}
                          </div>
                          <StatusPill status={c.status} label={clientStatusLabel(c.status)} />
                        </div>
                        <p className="mt-2 text-xs text-muted">
                          {[c.email, c.phone].filter(Boolean).join(" · ") || "No contact details"}
                        </p>
                        <p className="mt-3 text-xs font-medium text-muted">
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
              </section>
            );
          })}
          {clients.some((c) => !CLIENT_CATEGORIES.some((cat) => cat.id === c.category)) && (
            <p className="text-xs text-muted">
              Some clients have an unknown category — open them and set a category to file them
              correctly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
