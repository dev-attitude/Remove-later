import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";
import { TODO_CATEGORY_IDS } from "@/lib/business-todos";
import { todoCategoryData } from "@/lib/business-todos-schema";

export const dynamic = "force-dynamic";

const createSchema = z
  .object({
    title: z.string().min(1).max(300),
    description: z.string().max(5000).optional(),
    category: z.enum(TODO_CATEGORY_IDS).optional(),
    categoryOther: z.string().max(120).nullable().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    status: z.enum(["pending", "in_progress", "done", "cancelled"]).optional(),
    dueDate: z.string().nullable().optional(),
    reminderEnabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const category = data.category ?? "general";
    if (category === "other" && !data.categoryOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the other category",
        path: ["categoryOther"],
      });
    }
  });

export async function GET(req: Request) {
  try {
    await requireBusinessAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const todos = await prisma.bizTodo.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: 200,
    });

    const open = todos.filter((t) => t.status === "pending" || t.status === "in_progress");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary = {
      total: todos.length,
      open: open.length,
      overdue: open.filter((t) => t.dueDate && t.dueDate < today).length,
      dueToday: open.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }).length,
    };

    return NextResponse.json({ todos, summary });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireBusinessAdmin();
    const body = createSchema.parse(await req.json());
    const { category, categoryOther } = todoCategoryData(body);

    const maxOrder = await prisma.bizTodo.aggregate({ _max: { sortOrder: true } });

    const todo = await prisma.bizTodo.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category,
        categoryOther,
        priority: body.priority ?? "medium",
        status: body.status ?? "pending",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        reminderEnabled: body.reminderEnabled !== false,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid to-do data" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}
