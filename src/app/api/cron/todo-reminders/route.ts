import { NextResponse } from "next/server";
import { processBusinessTodoReminders } from "@/lib/services/business-todo-reminders";

export const dynamic = "force-dynamic";

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily morning digest of overdue, due today, and due tomorrow to-dos */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processBusinessTodoReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/todo-reminders]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 }
    );
  }
}
