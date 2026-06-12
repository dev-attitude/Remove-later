import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import {
  formatTodoCategory,
  isTodoOpen,
  startOfDay,
  todoPriorityLabel,
} from "@/lib/business-todos";
import { sendEmailToClient } from "@/lib/services/client-messaging";
import { COMPANY } from "@/lib/site-content";

function adminEmail(): string {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.BUSINESS_ADMIN_EMAILS?.split(",")[0]?.trim() ||
    COMPANY.email
  );
}

export type TodoReminderItem = {
  id: string;
  title: string;
  category: string;
  categoryOther: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  bucket: "overdue" | "today" | "tomorrow";
};

export async function listTodosForReminder(): Promise<TodoReminderItem[]> {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const todos = await prisma.bizTodo.findMany({
    where: {
      status: { in: ["pending", "in_progress"] },
      reminderEnabled: true,
      dueDate: { not: null },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  });

  const items: TodoReminderItem[] = [];

  for (const todo of todos) {
    if (!todo.dueDate || !isTodoOpen(todo.status)) continue;

    const due = startOfDay(todo.dueDate);
    let bucket: TodoReminderItem["bucket"] | null = null;

    if (due < today) bucket = "overdue";
    else if (due.getTime() === today.getTime()) bucket = "today";
    else if (due.getTime() === tomorrow.getTime()) bucket = "tomorrow";

    if (!bucket) continue;

    const remindedToday =
      todo.lastReminderAt && startOfDay(todo.lastReminderAt).getTime() === today.getTime();
    if (remindedToday && bucket !== "overdue") continue;

    items.push({
      id: todo.id,
      title: todo.title,
      category: todo.category,
      categoryOther: todo.categoryOther,
      priority: todo.priority,
      status: todo.status,
      dueDate: todo.dueDate.toISOString(),
      bucket,
    });
  }

  return items;
}

function buildDigestHtml(items: TodoReminderItem[]): string {
  const sections = [
    { key: "overdue" as const, title: "Overdue", color: "#dc2626" },
    { key: "today" as const, title: "Due today", color: "#d97706" },
    { key: "tomorrow" as const, title: "Due tomorrow", color: "#2563eb" },
  ];

  const blocks = sections
    .map(({ key, title, color }) => {
      const rows = items.filter((i) => i.bucket === key);
      if (rows.length === 0) return "";
      const list = rows
        .map(
          (t) =>
            `<li style="margin:8px 0"><strong>${t.title}</strong><br><span style="font-size:12px;color:#64748b">${formatTodoCategory(t.category, t.categoryOther)} · ${todoPriorityLabel(t.priority)} priority</span></li>`
        )
        .join("");
      return `<h3 style="color:${color};margin:16px 0 8px">${title} (${rows.length})</h3><ul style="padding-left:20px;margin:0">${list}</ul>`;
    })
    .filter(Boolean)
    .join("");

  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1f2937">
      <h2 style="color:#0f172a;margin:0 0 12px">Business to-do reminder</h2>
      <p style="margin:0 0 16px;color:#64748b">Your planning list for ${BRAND.companyName} — stay on top of operations and developments.</p>
      ${blocks || "<p>No items due for reminder today.</p>"}
      <p style="margin-top:24px"><a href="https://www.gmconsultations.com/manage/todos" style="color:#2563eb;font-weight:600">Open to-do & planning →</a></p>
    </div>
  `;
}

export async function processBusinessTodoReminders(): Promise<{
  items: number;
  emailSent: boolean;
  error?: string;
}> {
  const items = await listTodosForReminder();
  if (items.length === 0) {
    return { items: 0, emailSent: false };
  }

  const text = items
    .map(
      (t) =>
        `[${t.bucket.toUpperCase()}] ${t.title} (${formatTodoCategory(t.category, t.categoryOther)}, ${todoPriorityLabel(t.priority)})`
    )
    .join("\n");

  const html = buildDigestHtml(items);
  const subject = `${BRAND.companyName} — ${items.length} to-do reminder(s)`;

  const res = await sendEmailToClient(adminEmail(), subject, html, text);

  if (res.ok) {
    const now = new Date();
    await prisma.bizTodo.updateMany({
      where: { id: { in: items.map((i) => i.id) } },
      data: { lastReminderAt: now },
    });
  }

  return { items: items.length, emailSent: res.ok, error: res.error };
}
