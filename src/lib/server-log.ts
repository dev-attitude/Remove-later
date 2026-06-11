import { prisma } from "@/lib/db";

type InquiryInput = {
  kind: "contact" | "purchase" | "hosting_order";
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  packageId?: string | null;
  packageName?: string | null;
  message?: string | null;
  itemsJson?: string | null;
  totalNad?: number | null;
  orderRef?: string | null;
};

/** Persist a client request for the master admin inbox. Never throws — requests must succeed even if logging fails. */
export async function recordInquiry(input: InquiryInput): Promise<void> {
  try {
    await prisma.serviceInquiry.create({
      data: {
        kind: input.kind,
        name: input.name,
        email: input.email,
        phone: input.phone ?? undefined,
        subject: input.subject ?? undefined,
        packageId: input.packageId ?? undefined,
        packageName: input.packageName ?? undefined,
        message: input.message ?? undefined,
        itemsJson: input.itemsJson ?? undefined,
        totalNad: input.totalNad ?? undefined,
        orderRef: input.orderRef ?? undefined,
      },
    });
  } catch (e) {
    console.error("[server-log] failed to record inquiry", e);
  }
}

/** Persist a server error so admins can see what clients ran into. Never throws. */
export async function recordError(
  source: string,
  error: unknown,
  extra?: { userId?: string | null; metadata?: Record<string, unknown> }
): Promise<void> {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? (error.stack ?? null) : null;
    await prisma.errorLog.create({
      data: {
        source,
        message: message.slice(0, 4000),
        stack: stack?.slice(0, 8000),
        userId: extra?.userId ?? undefined,
        metadata: extra?.metadata ? JSON.stringify(extra.metadata).slice(0, 4000) : undefined,
      },
    });
  } catch (e) {
    console.error("[server-log] failed to record error", e);
  }
}
