import { config } from "@/lib/config";
import {
  createPlagiarismScan,
  savePlagiarismScanResult,
  waitForPlagiarismScan,
} from "@/lib/services/plagiarism-scan-store";

const LOGIN_URL = "https://id.copyleaks.com/v3/account/login/api";
const API_BASE = "https://api.copyleaks.com/v3";

type CopyleaksLoginResponse = { access_token: string; expires_in?: number };

type CopyleaksMatch = {
  url?: string;
  title?: string;
  introduction?: string;
  matchedWords?: number;
  identicalWords?: number;
};

type CopyleaksCompletedWebhook = {
  status?: number;
  scannedDocument?: { totalWords?: number; scanId?: string };
  results?: {
    score?: { aggregatedScore?: number };
    internet?: CopyleaksMatch[];
    database?: CopyleaksMatch[];
  };
  message?: string;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function copyleaksLogin(): Promise<string> {
  const email = config.copyleaks.email;
  const key = config.copyleaks.apiKey;
  if (!email || !key) throw new Error("Copyleaks is not configured");

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, key }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Copyleaks login failed (${res.status})${detail ? `: ${detail.slice(0, 120)}` : ""}`);
  }

  const data = (await res.json()) as CopyleaksLoginResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 48 * 3600) * 1000,
  };
  return data.access_token;
}

function webhookBaseUrl() {
  const base = config.appUrl.replace(/\/$/, "");
  return `${base}/api/plagiarism/webhook`;
}

export async function startCopyleaksScan(text: string): Promise<string> {
  const token = await copyleaksLogin();
  const scanId = `gm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base64 = Buffer.from(text, "utf8").toString("base64");

  await createPlagiarismScan(scanId);

  const res = await fetch(`${API_BASE}/scans/submit/file/${encodeURIComponent(scanId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      base64,
      filename: "document.txt",
      properties: {
        sandbox: config.copyleaks.sandbox,
        webhooks: {
          status: `${webhookBaseUrl()}/{STATUS}/${scanId}`,
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Copyleaks submit failed (${res.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`
    );
  }

  return scanId;
}

export async function startCopyleaksScansAfterCreditCheck(scanIds: string[]) {
  if (scanIds.length === 0) return;
  const token = await copyleaksLogin();
  await fetch(`${API_BASE}/scans/start`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ trigger: scanIds, errorHandling: 0 }),
  });
}

export function mapCopyleaksWebhookToResult(body: CopyleaksCompletedWebhook) {
  const totalWords = body.scannedDocument?.totalWords ?? 1;
  const similarity = Math.round(body.results?.score?.aggregatedScore ?? 0);
  const sources = [
    ...(body.results?.internet ?? []),
    ...(body.results?.database ?? []),
  ];

  const matches = sources.slice(0, 12).map((m) => {
    const matched = m.matchedWords ?? m.identicalWords ?? 0;
    const percent = totalWords > 0 ? Math.round((matched / totalWords) * 100) : 0;
    return {
      text: (m.introduction ?? m.title ?? "Matched content").slice(0, 240),
      source: m.url ?? m.title ?? "Unknown source",
      percent,
    };
  });

  return {
    similarity,
    matches,
    mode: "live" as const,
    note: config.copyleaks.sandbox
      ? "Copyleaks sandbox scan (free test mode — set COPYLEAKS_SANDBOX=false and add credits for live scans)"
      : undefined,
  };
}

export async function handleCopyleaksWebhook(
  status: string,
  scanId: string,
  body: CopyleaksCompletedWebhook
) {
  if (status === "creditsChecked") {
    if (!config.copyleaks.sandbox) {
      await startCopyleaksScansAfterCreditCheck([scanId]);
    }
    return;
  }

  if (status === "error") {
    await savePlagiarismScanResult(scanId, "error", {
      message: body.message ?? "Copyleaks scan error",
    });
    return;
  }

  if (status === "completed") {
    await savePlagiarismScanResult(scanId, "completed", mapCopyleaksWebhookToResult(body));
  }
}

export async function checkPlagiarismWithCopyleaks(text: string) {
  const scanId = await startCopyleaksScan(text);
  const result = await waitForPlagiarismScan(scanId);
  return result as ReturnType<typeof mapCopyleaksWebhookToResult>;
}
