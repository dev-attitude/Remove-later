import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isPortalId } from "@/lib/portals";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
  portal: z.enum(["institution", "student", "analysis", "developer"]),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());

    if (!isPortalId(data.portal)) {
      return NextResponse.json({ error: "Invalid portal" }, { status: 400 });
    }

    if (data.portal === "developer") {
      return NextResponse.json(
        { error: "Developer accounts are provisioned manually" },
        { status: 403 }
      );
    }

    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const role =
      data.portal === "institution"
        ? "supervisor"
        : data.portal === "analysis"
          ? "analyst"
          : "student";

    const user = await prisma.user.create({
      data: {
        email,
        name: data.name,
        passwordHash,
        portal: data.portal,
        role,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      portal: user.portal,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
    }
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
