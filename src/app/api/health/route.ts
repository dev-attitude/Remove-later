import { NextResponse } from "next/server";
import { config, getRuntimeMode } from "@/lib/config";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    status: "ok",
    appMode: config.appMode,
    runtimeMode: getRuntimeMode(),
    demoBanner: config.isDemoMode() || getRuntimeMode() === "demo",
    services: {
      database: dbOk,
      openai: config.openai.enabled(),
      stripe: config.stripe.enabled(),
      auth: Boolean(config.auth.secret),
    },
  });
}
