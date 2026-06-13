"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Trash2 } from "lucide-react";
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
  PAYMENT_PLANS,
  paymentPlanScheduleLabel,
  PHD_MONTHLY_PACKAGE_ID,
  serviceLabel,
} from "@/lib/business-manage";
import { getRegistrationWorkflow, getEngagementStepStatus } from "@/lib/registration-workflows";

export default function ManageServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [engagement, setEngagement] = useState<any>(null);
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const didInitialScroll = useRef(false);
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

  useEffect(() => {
    if (!engagement || didInitialScroll.current) return;
    const wf = getRegistrationWorkflow(engagement.packageId);
    if (!wf) return;
    const sorted = [...(engagement.tasks ?? [])].sort(
      (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder
    );
    const stepStatus = getEngagementStepStatus(engagement.packageId, sorted);
    if (!stepStatus?.current) return;
    didInitialScroll.current = true;
    setHighlightTaskId(stepStatus.current.id);
    requestAnimationFrame(() => {
      taskRefs.current[stepStatus.current!.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [engagement]);

  async function toggleTask(taskId: string, done: boolean) {
    setNotifyMsg(null);
    setHighlightTaskId(null);
    const res = await fetch(`/api/manage/engagements/${id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, done }),
    });
    const data = await res.json();
    const messages: string[] = [];
    if (data.notification) {
      const n = data.notification as { email: boolean; sms: boolean; errors: string[] };
      if (n.email && n.sms) messages.push("Update sent to client by email and SMS.");
      else if (n.email) messages.push("Update sent to client by email.");
      else if (n.sms) messages.push("Update sent to client by SMS.");
      else if (n.errors?.length) messages.push(`Notification issue: ${n.errors.join(" ")}`);
    }
    if (data.nextTask) {
      const next = data.nextTask as { id: string; title: string };
      messages.push(`Next step: ${next.title}`);
      setHighlightTaskId(next.id);
    }
    if (data.payment?.recorded) {
      const p = data.payment as { amount: number; invoiceSent: boolean; error?: string };
      const inv = p.invoiceSent
        ? " Invoice emailed to client."
        : p.error
          ? ` Invoice not sent: ${p.error}`
          : "";
      messages.push(`Balance payment ${formatNad(p.amount)} recorded.${inv}`);
    }
    if (messages.length) setNotifyMsg(messages.join(" "));
    await load();
    if (data.nextTask?.id) {
      requestAnimationFrame(() => {
        taskRefs.current[data.nextTask.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
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

  async function deleteService() {
    if (!engagement) return;
    setDeleteError(null);
    const incomeCount = engagement.income?.length ?? 0;
    const expenseCount = engagement.expenses?.length ?? 0;
    const financeNote =
      incomeCount + expenseCount > 0
        ? `\n\nThis also removes ${incomeCount} payment record(s) and ${expenseCount} expense(s) linked to this service.`
        : "";
    const confirmed = window.confirm(
      `Delete "${engagement.title}" for ${engagement.client.name}? All steps and notifications will be removed.${financeNote}\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/manage/engagements/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete service");
      router.push(`/manage/clients/${engagement.clientId}`);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete service");
      setDeleting(false);
    }
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

  const workflow = getRegistrationWorkflow(engagement.packageId);
  const isPhdRetainer = engagement.packageId === PHD_MONTHLY_PACKAGE_ID;
  const paymentPlanLabel = PAYMENT_PLANS.find((p) => p.id === engagement.paymentPlan)?.label;
  const sortedTasks = [...(engagement.tasks ?? [])].sort(
    (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder
  );
  const stepStatus = workflow ? getEngagementStepStatus(engagement.packageId, sortedTasks) : null;
  const firstOpenIdx = sortedTasks.findIndex((t: { done: boolean }) => !t.done);
  const lastCompleted = stepStatus?.completed.length
    ? stepStatus.completed[stepStatus.completed.length - 1]
    : null;

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

      {isPhdRetainer && (
        <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          <p className="font-semibold">PhD monthly retainer</p>
          <p className="mt-1 text-violet-800">
            This client is billed N$ {engagement.quotedAmount ?? 800} per month (+ 15% VAT). The
            first invoice is sent when the service is created; after that, invoices are generated
            automatically on the 1st of each month while status is In progress or Quoted.
          </p>
        </div>
      )}

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
            {engagement.quotedAmount > engagement.paidAmount && (
              <>
                {" "}
                · Balance {formatNad(engagement.quotedAmount - engagement.paidAmount)}
                {" · "}
                <Link
                  href={`/manage/invoices?clientId=${engagement.client.id}&engagementId=${engagement.id}`}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Invoice balance
                </Link>
              </>
            )}
          </p>
        )}
        {engagement.paymentPlan && (
          <p className="mt-2 text-xs text-slate-600">
            Payment plan: {paymentPlanLabel ?? engagement.paymentPlan}
            {engagement.depositPaid && " · Deposit recorded"}
            {engagement.balancePaid && " · Fully paid"}
          </p>
        )}
        {engagement.client.email || engagement.client.phone ? (
          <p className="mt-3 text-xs text-slate-500">
            Client notifications: {engagement.client.email || "no email"} ·{" "}
            {engagement.client.phone || "no phone"}
          </p>
        ) : (
          <p className="mt-3 text-xs text-amber-700">
            Add client email and phone to send registration updates automatically.
          </p>
        )}
        {notifyMsg && (
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {notifyMsg}
          </p>
        )}
        {stepStatus?.current && (
          <div className="mt-4 rounded-xl border-2 border-brand-400 bg-brand-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Current step — work on this now
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Step {stepStatus.currentIndex + 1} of {stepStatus.total}: {stepStatus.current.title}
            </p>
            {stepStatus.current.durationNote && (
              <p className="mt-1 text-sm text-slate-600">{stepStatus.current.durationNote}</p>
            )}
            {lastCompleted && (
              <p className="mt-3 text-sm text-emerald-700">
                ✓ Completed: {lastCompleted.title}
              </p>
            )}
          </div>
        )}
        {stepStatus?.allDone && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            All {stepStatus.total} registration steps are complete.
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>
            {workflow ? "Registration steps (BIPA workflow)" : "Work checklist"}
          </CardTitle>
          {workflow && (
            <p className="mt-1 text-xs text-slate-500">
              {workflow.label} — tick each step when complete. Client receives email & SMS update.
            </p>
          )}
          {workflow && stepStatus?.current && (
            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
              <span className="font-semibold">Active:</span> Step {stepStatus.currentIndex + 1} —{" "}
              {stepStatus.current.title}
              {stepStatus.upcoming.length > 0 && (
                <span className="block mt-1 text-xs text-brand-700">
                  Then: {stepStatus.upcoming[0].title}
                  {stepStatus.upcoming.length > 1
                    ? ` (+${stepStatus.upcoming.length - 1} more)`
                    : ""}
                </span>
              )}
            </p>
          )}
          {workflow && sortedTasks.length === 0 && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Registration steps are loading… refresh the page if this message stays.
            </p>
          )}
          <ul className="mt-4 space-y-2">
            {sortedTasks.map((t: any, idx: number) => {
              const isCurrent = !t.done && idx === firstOpenIdx;
              const isHighlighted = highlightTaskId === t.id || isCurrent;
              return (
                <li
                  key={t.id}
                  ref={(el) => {
                    taskRefs.current[t.id] = el;
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id, !t.done)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                      isHighlighted ? "border border-brand-300 bg-brand-50 ring-1 ring-brand-200" : ""
                    }`}
                  >
                    {t.done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 shrink-0 ${isCurrent ? "text-brand-600" : "text-slate-300"}`}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          t.done ? "text-slate-500 line-through" : "font-medium text-slate-800"
                        }
                      >
                        {idx + 1}. {t.title}
                      </span>
                      {t.durationNote && (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {t.durationNote}
                        </span>
                      )}
                      {isHighlighted && !t.done && (
                        <span className="mt-0.5 block text-xs font-medium text-brand-700">
                          {highlightTaskId === t.id ? "Next step — in progress" : "Current step"}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!workflow && (
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
          )}
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
          <CardTitle>{workflow ? "Automatic payments" : "Record payment (income)"}</CardTitle>
          {workflow ? (
            <p className="mt-3 text-sm text-slate-600">
              Registration payments are recorded automatically when the service is created (
              {paymentPlanScheduleLabel(engagement.paymentPlan)}). Invoices are emailed to{" "}
              {engagement.client.email || "the client (add email on file)"}.
            </p>
          ) : (
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
          )}
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

      <Card className="mt-6 border-red-200">
        <CardTitle className="text-red-800">Delete service</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Remove this service if it was created by mistake. Only business admins can do this.
          Linked automatic payments and expenses for this service are removed from your income
          records too.
        </p>
        {deleteError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={deleting}
          onClick={deleteService}
          className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Deleting…" : "Delete this service"}
        </Button>
      </Card>
    </div>
  );
}
