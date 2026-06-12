import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";
import { TODO_CATEGORY_IDS } from "@/lib/business-todos";
import { todoCategoryData } from "@/lib/business-todos-schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).nullable().optional(),
    category: z.enum(TODO_CATEGORY_IDS).optional(),
    categoryOther: z.string().max(120).nullable().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    status: z.enum(["pending", "in_progress", "done", "cancelled"]).optional(),
    dueDate: z.string().nullable().optional(),
    reminderEnabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "other" && data.categoryOther !== undefined && !data.categoryOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the other category",
        path: ["categoryOther"],
      });
    }
  });

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const existing = await prisma.bizTodo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "To-do not found" }, { status: 404 });
    }

    const markingDone = body.status === "done" && existing.status !== "done";
    const reopening = body.status && body.status !== "done" && existing.status === "done";

    let categoryPatch: { category?: string; categoryOther?: string | null } = {};
    if (body.category !== undefined || body.categoryOther !== undefined) {
      const merged = todoCategoryData({
        category: body.category ?? existing.category,
        categoryOther:
          body.categoryOther !== undefined
            ? body.categoryOther
            : body.category === "other"
              ? existing.categoryOther
              : null,
      });
      if (merged.category === "other" && !merged.categoryOther) {
        return NextResponse.json(
          { error: "Please specify the other category" },
          { status: 400 }
        );
      }
      categoryPatch = merged;
    }

    const todo = await prisma.bizTodo.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...categoryPatch,
        ...(body.priority !== undefined ? { priority: body.priority } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.dueDate !== undefined
          ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
          : {}),
        ...(body.reminderEnabled !== undefined ? { reminderEnabled: body.reminderEnabled } : {}),
        ...(markingDone ? { completedAt: new Date() } : {}),
        ...(reopening ? { completedAt: null } : {}),
      },
    });

    return NextResponse.json({ todo });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    await prisma.bizTodo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
