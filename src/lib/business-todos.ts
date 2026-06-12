export const TODO_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "operations", label: "Operations & admin" },
  { id: "development", label: "Products & development" },
  { id: "marketing", label: "Marketing & sales" },
  { id: "finance", label: "Finance & billing" },
  { id: "clients", label: "Client follow-up" },
  { id: "compliance", label: "Compliance & registrations" },
] as const;

export const TODO_PRIORITIES = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
] as const;

export const TODO_STATUSES = [
  { id: "pending", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type TodoCategoryId = (typeof TODO_CATEGORIES)[number]["id"];
export type TodoPriorityId = (typeof TODO_PRIORITIES)[number]["id"];
export type TodoStatusId = (typeof TODO_STATUSES)[number]["id"];

export function todoCategoryLabel(id: string) {
  return TODO_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function todoPriorityLabel(id: string) {
  return TODO_PRIORITIES.find((p) => p.id === id)?.label ?? id;
}

export function todoStatusLabel(id: string) {
  return TODO_STATUSES.find((s) => s.id === id)?.label ?? id;
}

export function isTodoOpen(status: string) {
  return status === "pending" || status === "in_progress";
}

export function startOfDay(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfDay(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function todoDueBucket(dueDate: Date | null, status: string): string {
  if (!isTodoOpen(status)) return "closed";
  if (!dueDate) return "no_date";
  const today = startOfDay();
  const due = startOfDay(dueDate);
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  const weekAhead = new Date(today);
  weekAhead.setDate(weekAhead.getDate() + 7);
  if (due <= weekAhead) return "upcoming";
  return "later";
}
