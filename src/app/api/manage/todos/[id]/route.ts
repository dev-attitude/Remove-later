import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).nullable().optional(),
  category: z
    .enum(["general", "operations", "development", "marketing", "finance", "clients", "compliance"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "done", "cancelled"]).optional(),
  dueDate: z.string().nullable().optional(),
  reminderEnabled: z.boolean().optional(),
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

    const todo = await prisma.bizTodo.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
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
