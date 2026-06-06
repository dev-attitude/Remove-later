import { NextResponse } from "next/server";
import { BusinessAdminError } from "@/lib/business-admin";

export function manageErrorResponse(e: unknown) {
  if (e instanceof BusinessAdminError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("[manage]", e);
  return NextResponse.json(
    { error: e instanceof Error ? e.message : "Request failed" },
    { status: 500 }
  );
}
