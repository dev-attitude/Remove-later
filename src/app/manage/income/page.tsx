"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { ManageStatCard } from "@/components/manage/ManageStatCard";
import {
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  formatNad,
} from "@/lib/business-manage";

export default function ManageIncomePage() {
  const [income, setIncome] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({
    clientId: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "service_payment",
    paymentMethod: "EFT / Bank transfer",
    description: "",
  });

  function reload() {
    fetch("/api/manage/income")
      .then((r) => r.json())
      .then((d) => setIncome(d.income ?? []));
  }

  useEffect(() => {
    reload();
    fetch("/api/manage/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/manage/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        clientId: form.clientId || undefined,
        amount: Number(form.amount),
      }),
    });
    setForm((f) => ({ ...f, amount: "", description: "" }));
    reload();
  }

  const total = income.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <ManagePageHeader
        title="Income"
        description="Record client payments — registrations, consulting, student assistance & more."
      />

      <ManageStatCard
        className="mb-6"
        label="Total recorded"
        value={formatNad(total)}
        tone="success"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="manage">
          <CardTitle>Record income</CardTitle>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <select
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">No client linked</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount (NAD) *"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <select
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {INCOME_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              placeholder="Description"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Button type="submit">Save</Button>
          </form>
        </Card>

        <Card>
          <CardTitle>Recent income</CardTitle>
          <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
            {income.map((i) => (
              <li
                key={i.id}
                className="flex justify-between gap-2 border-b border-line py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-charcoal">{formatNad(i.amount)}</p>
                  <p className="text-xs text-muted">
                    {i.client?.name || "General"} · {new Date(i.date).toLocaleDateString()}
                    {i.engagement ? ` · ${i.engagement.title}` : ""}
                  </p>
                </div>
              </li>
            ))}
            {income.length === 0 && (
              <li className="text-sm text-muted">No income recorded yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
