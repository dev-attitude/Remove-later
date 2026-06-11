import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { prisma } from "@/lib/db";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireBusinessAdmin();

    const [inquiries, byStatus, byKind] = await Promise.all([
      prisma.serviceInquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.serviceInquiry.groupBy({ by: ["status"], _count: true }),
      prisma.serviceInquiry.groupBy({ by: ["kind"], _count: true }),
    ]);

    return NextResponse.json({
      inquiries,
      summary: {
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        byKind: Object.fromEntries(byKind.map((k) => [k.kind, k._count])),
      },
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
