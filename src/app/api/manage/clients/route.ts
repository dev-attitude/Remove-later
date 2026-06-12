import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

const categorySchema = z.enum([
  "hosting-web",
  "research-app",
  "student-writing",
  "business-consulting",
  "registration",
  "it-support",
  "campus",
  "general",
]);

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  status: z.enum(["prospect", "active", "completed", "archived"]).optional(),
  category: categorySchema.optional(),
  notes: z.string().max(5000).optional(),
});

export async function GET(req: Request) {
  try {
    await requireBusinessAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();

    const clients = await prisma.bizClient.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { company: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { engagements: true, income: true } },
        engagements: {
          take: 1,
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, status: true, progressPercent: true },
        },
      },
    });

    return NextResponse.json({ clients });
  } catch (e) {
    return manageErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireBusinessAdmin();
    const body = createSchema.parse(await req.json());

    const client = await prisma.bizClient.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        location: body.location?.trim() || null,
        status: body.status ?? "active",
        category: body.category ?? "general",
        notes: body.notes?.trim() || null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
