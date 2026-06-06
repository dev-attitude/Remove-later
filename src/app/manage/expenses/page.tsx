"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EXPENSE_CATEGORIES, formatNad } from "@/lib/business-manage";

export default function ManageExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [form, setForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "other",
    vendor: "",
    description: "",
  });

  function reload() {
    fetch("/api/manage/expenses")
      .then((r) => r.json())
      .then((d) => setExpenses(d.expenses ?? []));
  }

  useEffect(() => {
    reload();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/manage/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setForm((f) => ({ ...f, amount: "", vendor: "", description: "" }));
    reload();
  }

  const total = expenses.reduce((s, x) => s + x.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Expenses</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">
        Track filing fees, travel, software, subcontractors & other business costs.
      </p>

      <Card className="mb-6 !p-4">
        <p className="text-xs text-slate-500">Total recorded</p>
        <p className="text-2xl font-bold text-red-600">{formatNad(total)}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Record expense</CardTitle>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount (NAD) *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Vendor / payee"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
            <input
              placeholder="Description"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Button type="submit">Save</Button>
          </form>
        </Card>

        <Card>
          <CardTitle>Recent expenses</CardTitle>
          <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
            {expenses.map((x) => (
              <li
                key={x.id}
                className="flex justify-between gap-2 border-b border-slate-100 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{formatNad(x.amount)}</p>
                  <p className="text-xs text-slate-500">
                    {x.vendor || x.category} · {new Date(x.date).toLocaleDateString()}
                    {x.engagement ? ` · ${x.engagement.title}` : ""}
                  </p>
                </div>
              </li>
            ))}
            {expenses.length === 0 && (
              <li className="text-sm text-slate-500">No expenses recorded yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
