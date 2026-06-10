import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim();
  const tenantSlug = req.nextUrl.searchParams.get("tenant")?.trim();

  if (!code) {
    return NextResponse.json({ valid: false, message: "Verification code required." });
  }

  const credential = await prisma.campusCredential.findUnique({
    where: { verifyCode: code },
    include: { tenant: true },
  });

  if (!credential) {
    return NextResponse.json({ valid: false, message: "No matching credential found." });
  }

  if (tenantSlug && credential.tenant.slug !== tenantSlug) {
    return NextResponse.json({ valid: false, message: "Code not issued by this institution." });
  }

  return NextResponse.json({
    valid: true,
    studentName: credential.studentName,
    qualification: credential.qualification,
    yearAwarded: credential.yearAwarded,
    blockchainHash: credential.blockchainHash,
    institution: credential.tenant.name,
  });
}
