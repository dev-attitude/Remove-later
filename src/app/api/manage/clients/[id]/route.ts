import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  status: z.enum(["prospect", "active", "completed", "archived"]).optional(),
  notes: z.string().max(5000).optional(),
});

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;

    const client = await prisma.bizClient.findUnique({
      where: { id },
      include: {
        engagements: {
          orderBy: { updatedAt: "desc" },
          include: {
            tasks: { orderBy: { sortOrder: "asc" } },
            _count: { select: { income: true, expenses: true } },
          },
        },
        income: { orderBy: { date: "desc" }, take: 20 },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const client = await prisma.bizClient.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email.trim() || null } : {}),
        ...(body.phone !== undefined ? { phone: body.phone.trim() || null } : {}),
        ...(body.company !== undefined ? { company: body.company.trim() || null } : {}),
        ...(body.location !== undefined ? { location: body.location.trim() || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes.trim() || null } : {}),
      },
    });

    return NextResponse.json({ client });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    await prisma.bizClient.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
