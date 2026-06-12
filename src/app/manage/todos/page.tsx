"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  formatTodoCategory,
  TODO_CATEGORIES,
  TODO_PRIORITIES,
  TODO_STATUSES,
  todoDueBucket,
  todoPriorityLabel,
  todoStatusLabel,
} from "@/lib/business-todos";

type TodoRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  categoryOther: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  reminderEnabled: boolean;
  completedAt: string | null;
  createdAt: string;
};

type Summary = { total: number; open: number; overdue: number; dueToday: number };

const BUCKET_LABELS: Record<string, string> = {
  overdue: "Overdue",
  today: "Due today",
  upcoming: "Next 7 days",
  later: "Later",
  no_date: "No due date",
  closed: "Completed / cancelled",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-800 bg-orange-50 border-orange-200",
  medium: "text-slate-700 bg-slate-50 border-slate-200",
  low: "text-slate-500 bg-slate-50 border-slate-100",
};

function fmtDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-NA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ManageTodosPage() {
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showDone, setShowDone] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [categoryOther, setCategoryOther] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterCategory) params.set("category", filterCategory);
      const res = await fetch(`/api/manage/todos?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTodos(data.todos);
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const visible = showDone
      ? todos
      : todos.filter((t) => t.status !== "done" && t.status !== "cancelled");

    const buckets = new Map<string, TodoRow[]>();
    for (const todo of visible) {
      const bucket = todoDueBucket(todo.dueDate ? new Date(todo.dueDate) : null, todo.status);
      if (!buckets.has(bucket)) buckets.set(bucket, []);
      buckets.get(bucket)!.push(todo);
    }

    const order = ["overdue", "today", "upcoming", "later", "no_date", "closed"];
    return order
      .filter((b) => buckets.has(b))
      .map((b) => ({ bucket: b, items: buckets.get(b)! }));
  }, [todos, showDone]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (category === "other" && !categoryOther.trim()) {
      setError("Please specify the other category.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/manage/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          categoryOther: category === "other" ? categoryOther.trim() : null,
          priority,
          dueDate: dueDate || null,
          reminderEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle("");
      setDescription("");
      setCategoryOther("");
      setDueDate("");
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTodo(id: string, patch: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/manage/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function deleteTodo(id: string) {
    if (!confirm("Delete this to-do?")) return;
    try {
      const res = await fetch(`/api/manage/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading && todos.length === 0) {
    return <p className="text-sm text-slate-500">Loading to-do list…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">To-do & planning</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Plan business operations, product developments, and follow-ups. Daily email reminders
            go to your business inbox for overdue, due today, and due tomorrow items.
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Add to-do
        </Button>
      </div>

      {summary && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="!p-4">
            <p className="text-xs text-slate-500">Open tasks</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.open}</p>
          </Card>
          <Card className="!p-4 !border-red-200 !bg-red-50/40">
            <p className="text-xs text-red-700">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{summary.overdue}</p>
          </Card>
          <Card className="!p-4 !border-amber-200 !bg-amber-50/40">
            <p className="text-xs text-amber-800">Due today</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{summary.dueToday}</p>
          </Card>
          <Card className="!p-4">
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Bell className="h-3 w-3" /> Daily reminders
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">07:00 UTC to admin email</p>
          </Card>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {showForm && (
        <Card className="mb-6">
          <CardTitle>New to-do</CardTitle>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <input
              required
              placeholder="What needs to be done? *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Details, links, or plan notes (optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Category</span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== "other") setCategoryOther("");
                  }}
                >
                  {TODO_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              {category === "other" && (
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-slate-700">Specify other category *</span>
                  <input
                    required
                    placeholder="e.g. Staff training, Legal, Partnerships…"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={categoryOther}
                    onChange={(e) => setCategoryOther(e.target.value)}
                  />
                </label>
              )}
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Priority</span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {TODO_PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Due date</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                />
                <span className="font-medium text-slate-700">Email reminder</span>
              </label>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Add to list"}
            </Button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {TODO_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {TODO_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Show completed
        </label>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <ListTodo className="h-4 w-4" />
            No to-dos yet. Add tasks for business planning, developments, and follow-ups.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ bucket, items }) => (
            <section key={bucket}>
              <h2
                className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide ${
                  bucket === "overdue"
                    ? "text-red-700"
                    : bucket === "today"
                      ? "text-amber-800"
                      : "text-slate-500"
                }`}
              >
                {bucket === "overdue" && <AlertCircle className="h-4 w-4" />}
                {bucket === "today" && <Clock className="h-4 w-4" />}
                {bucket === "upcoming" && <Calendar className="h-4 w-4" />}
                {BUCKET_LABELS[bucket]} ({items.length})
              </h2>
              <ul className="space-y-2">
                {items.map((todo) => {
                  const done = todo.status === "done";
                  const cancelled = todo.status === "cancelled";
                  return (
                    <li key={todo.id}>
                      <Card
                        className={`!p-4 ${done || cancelled ? "opacity-60" : ""} ${
                          bucket === "overdue" && !done ? "!border-red-200" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateTodo(todo.id, {
                                status: done ? "pending" : "done",
                              })
                            }
                            className="mt-0.5 shrink-0 text-brand-600 hover:text-brand-800"
                            title={done ? "Mark incomplete" : "Mark done"}
                          >
                            {done ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p
                                className={`font-medium text-slate-900 ${done ? "line-through" : ""}`}
                              >
                                {todo.title}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_COLORS[todo.priority] ?? PRIORITY_COLORS.medium}`}
                                >
                                  {todoPriorityLabel(todo.priority)}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  {formatTodoCategory(todo.category, todo.categoryOther)}
                                </span>
                              </div>
                            </div>
                            {todo.description && (
                              <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                                {todo.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              {todo.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due {fmtDate(todo.dueDate)}
                                </span>
                              )}
                              <span>{todoStatusLabel(todo.status)}</span>
                              {todo.reminderEnabled && todo.dueDate && !done && (
                                <span className="flex items-center gap-1 text-brand-700">
                                  <Bell className="h-3 w-3" /> Reminder on
                                </span>
                              )}
                            </div>
                            {!done && !cancelled && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {todo.status === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => updateTodo(todo.id, { status: "in_progress" })}
                                    className="text-xs font-semibold text-brand-700 hover:underline"
                                  >
                                    Start
                                  </button>
                                )}
                                {todo.status === "in_progress" && (
                                  <button
                                    type="button"
                                    onClick={() => updateTodo(todo.id, { status: "pending" })}
                                    className="text-xs font-semibold text-slate-600 hover:underline"
                                  >
                                    Pause
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => deleteTodo(todo.id)}
                                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <ListTodo className="h-3.5 w-3.5" />
        Use categories to separate operations, product development, marketing, and client work.
        Reminders are emailed to your business inbox each morning.
      </p>
    </div>
  );
}
