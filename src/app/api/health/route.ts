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
    appUrl: config.appUrl,
    appMode: config.appMode,
    runtimeMode: getRuntimeMode(),
    demoBanner: config.isDemoMode() || getRuntimeMode() === "demo",
    services: {
      database: dbOk,
      openai: config.openai.enabled(),
      stripe: config.stripe.enabled(),
      auth: Boolean(config.auth.secret),
      blobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
    aiDetectors: {
      gptzero: config.aiDetection.gptzero.enabled(),
      openai: config.openai.enabled(),
      gemini: config.gemini.enabled(),
      grok: config.xai.enabled(),
      defaultProvider: config.aiDetection.defaultProvider,
    },
  });
}
