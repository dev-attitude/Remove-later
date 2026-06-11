import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]).optional(),
  adminNotes: z.string().max(4000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireBusinessAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());

    const inquiry = await prisma.serviceInquiry.update({
      where: { id },
      data: {
        status: body.status,
        adminNotes: body.adminNotes,
      },
    });

    return NextResponse.json({ inquiry });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }
    return manageErrorResponse(e);
  }
}
