"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/manage/StatusPill";
import {
  ENGAGEMENT_STATUSES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  engagementStatusLabel,
  formatNad,
  serviceLabel,
} from "@/lib/business-manage";

export default function ManageServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [engagement, setEngagement] = useState<any>(null);
  const [newTask, setNewTask] = useState("");
  const [incomeForm, setIncomeForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "service_payment",
    paymentMethod: "EFT / Bank transfer",
    description: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "filing_fees",
    vendor: "",
    description: "",
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/manage/engagements/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setEngagement(data.engagement);
  }, [id]);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  async function toggleTask(taskId: string, done: boolean) {
    await fetch(`/api/manage/engagements/${id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, done }),
    });
    load();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    await fetch(`/api/manage/engagements/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });
    setNewTask("");
    load();
  }

  async function updateStatus(status: string) {
    await fetch(`/api/manage/engagements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function recordIncome(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/manage/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: engagement.clientId,
        engagementId: id,
        amount: Number(incomeForm.amount),
        date: incomeForm.date,
        category: incomeForm.category,
        paymentMethod: incomeForm.paymentMethod,
        description: incomeForm.description,
      }),
    });
    setIncomeForm((f) => ({ ...f, amount: "", description: "" }));
    load();
  }

  async function recordExpense(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/manage/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engagementId: id,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        category: expenseForm.category,
        vendor: expenseForm.vendor,
        description: expenseForm.description,
      }),
    });
    setExpenseForm((f) => ({ ...f, amount: "", vendor: "", description: "" }));
    load();
  }

  if (!engagement) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <Link
        href={`/manage/clients/${engagement.clientId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> {engagement.client.name}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{engagement.title}</h1>
          <p className="text-sm text-slate-600">{serviceLabel(engagement.serviceSlug)}</p>
          <div className="mt-2">
            <StatusPill
              status={engagement.status}
              label={engagementStatusLabel(engagement.status)}
            />
          </div>
        </div>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={engagement.status}
          onChange={(e) => updateStatus(e.target.value)}
        >
          {ENGAGEMENT_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-700">Progress</p>
          <span className="text-lg font-bold text-brand-700">{engagement.progressPercent}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${engagement.progressPercent}%` }}
          />
        </div>
        {engagement.quotedAmount != null && (
          <p className="mt-3 text-sm text-slate-600">
            Quoted {formatNad(engagement.quotedAmount)} · Received{" "}
            {formatNad(engagement.paidAmount)}
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Work checklist</CardTitle>
          <ul className="mt-4 space-y-2">
            {engagement.tasks.map((t: any) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => toggleTask(t.id, !t.done)}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                >
                  {t.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                  )}
                  <span className={t.done ? "text-slate-500 line-through" : "text-slate-800"}>
                    {t.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={addTask} className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Add task…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
        </Card>

        <Card>
          <CardTitle>Notes</CardTitle>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
            {engagement.notes || "No notes yet."}
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Record payment (income)</CardTitle>
          <form onSubmit={recordIncome} className="mt-4 space-y-3">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount (NAD)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={incomeForm.date}
              onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={incomeForm.category}
              onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
            >
              {INCOME_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={incomeForm.paymentMethod}
              onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Button type="submit">Save income</Button>
          </form>
          {engagement.income?.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-600">
              {engagement.income.map((i: any) => (
                <li key={i.id}>
                  {formatNad(i.amount)} · {new Date(i.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Record expense</CardTitle>
          <form onSubmit={recordExpense} className="mt-4 space-y-3">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount (NAD)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Vendor"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={expenseForm.vendor}
              onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
            />
            <Button type="submit">Save expense</Button>
          </form>
          {engagement.expenses?.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-600">
              {engagement.expenses.map((x: any) => (
                <li key={x.id}>
                  {formatNad(x.amount)} · {x.vendor || x.category} ·{" "}
                  {new Date(x.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
