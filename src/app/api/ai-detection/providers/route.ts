import { NextResponse } from "next/server";
import { listAIDetectors } from "@/lib/services/ai-detectors/registry";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    providers: listAIDetectors(),
    defaultProvider: config.aiDetection.defaultProvider,
  });
}
