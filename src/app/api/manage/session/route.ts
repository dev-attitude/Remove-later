import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/business-admin";
import { manageErrorResponse } from "@/lib/manage-api";

export const dynamic = "force-dynamic";

/** Confirms the signed-in user may access Business Manager (/manage). */
export async function GET() {
  try {
    const session = await requireBusinessAdmin();
    return NextResponse.json({
      ok: true,
      name: session.user.name,
      email: session.user.email,
    });
  } catch (e) {
    return manageErrorResponse(e);
  }
}
