import { prisma } from "@/lib/db";

export type PlagiarismScanStatus = "pending" | "completed" | "error";

export async function createPlagiarismScan(scanId: string) {
  await prisma.plagiarismScanCache.upsert({
    where: { scanId },
    create: { scanId, status: "pending" },
    update: { status: "pending", payload: null },
  });
}

export async function savePlagiarismScanResult(
  scanId: string,
  status: PlagiarismScanStatus,
  payload: unknown
) {
  await prisma.plagiarismScanCache.upsert({
    where: { scanId },
    create: {
      scanId,
      status,
      payload: JSON.stringify(payload),
    },
    update: {
      status,
      payload: JSON.stringify(payload),
    },
  });
}

export async function getPlagiarismScan(scanId: string) {
  return prisma.plagiarismScanCache.findUnique({ where: { scanId } });
}

export async function waitForPlagiarismScan(scanId: string, maxMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < maxMs) {
    const row = await getPlagiarismScan(scanId);
    if (row?.status === "completed" && row.payload) {
      return JSON.parse(row.payload) as unknown;
    }
    if (row?.status === "error" && row.payload) {
      const err = JSON.parse(row.payload) as { message?: string };
      throw new Error(err.message ?? "Copyleaks scan failed");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Plagiarism scan timed out — try again in a moment");
}
