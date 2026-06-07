import { HOSTING_DEMO_STORAGE_KEY, type HostingDemoAccount } from "@/lib/hosting-demo";
import type {
  DnsRecord,
  DomainRecord,
  EmailMailbox,
  GrowthToolId,
  HostingClientAccount,
  InstalledApp,
} from "@/lib/hosting-account-types";
import { DEFAULT_OFFERS } from "@/lib/hosting-account-types";
import { HOSTING_DEMO_USER_NAME } from "@/lib/hosting-account-nav";

function defaultDns(domain: string): DnsRecord[] {
  return [
    { id: "1", type: "A", host: "@", value: "192.0.2.10", ttl: 3600 },
    { id: "2", type: "CNAME", host: "www", value: domain, ttl: 3600 },
    { id: "3", type: "MX", host: "@", value: `mail.${domain}`, ttl: 3600 },
    { id: "4", type: "TXT", host: "@", value: "v=spf1 include:_spf.gmconsultations.com ~all", ttl: 3600 },
  ];
}

function diskTotalForPlan(planId: string | undefined) {
  if (planId === "hosting-premium") return 100;
  if (planId === "hosting-business") return 50;
  return 10;
}

/** Enrich legacy order payload into full client account */
export function normalizeClientAccount(raw: HostingDemoAccount): HostingClientAccount {
  const primaryDomain = raw.domains[0]?.domain ?? "yourdomain.com";
  const planId = raw.plan?.id;

  const domains: DomainRecord[] = raw.domains.map((d) => ({
    domain: d.domain,
    status: d.status === "pending" ? "pending" : "active",
    expiresAt: d.expiresAt,
    autoRenew: true,
    privacy: true,
    registrar: "GM Consultations",
  }));

  const dnsByDomain: Record<string, DnsRecord[]> = {};
  for (const d of domains) {
    dnsByDomain[d.domain] = defaultDns(d.domain);
  }

  const emails: EmailMailbox[] = raw.emails.map((e, i) => ({
    id: `mail-${i}`,
    address: e.address,
    storageUsedMb: parseInt(e.storageUsed, 10) || 0,
    quotaMb: e.quota.includes("GB") ? 1024 : 500,
    createdAt: raw.createdAt,
  }));

  const databases = raw.databases.map((db, i) => ({
    id: `db-${i}`,
    name: db.name,
    sizeMb: parseInt(db.size, 10) || 0,
    engine: db.engine,
    users: 1,
  }));

  const ssl = raw.ssl.map((s) => ({
    domain: s.domain,
    status: s.status as "active" | "pending" | "expired",
    expiresAt: s.expiresAt,
    type: "AutoSSL" as const,
    autoRenew: true,
  }));

  const hostingServices = raw.plan
    ? [
        {
          id: "host-1",
          planName: raw.plan.name,
          primaryDomain,
          status: raw.provisioningSteps.every((s) => s.done)
            ? ("active" as const)
            : ("pending" as const),
          diskUsedGb: 0.4,
          diskTotalGb: diskTotalForPlan(planId),
          bandwidthUsedGb: 1.2,
          bandwidthTotalGb: diskTotalForPlan(planId) * 2,
          phpVersion: "8.2",
          backupSchedule: planId === "hosting-starter" ? ("weekly" as const) : ("daily" as const),
        },
      ]
    : [];

  return {
    ...raw,
    domains,
    dnsByDomain,
    emails,
    databases,
    ssl,
    hostingServices,
    installedApps: [],
    offers: DEFAULT_OFFERS.map((o) => ({ ...o, redeemed: false })),
    growthToolsUsed: [],
    activity: [
      {
        id: "act-1",
        at: raw.createdAt,
        message: `Order ${raw.orderId} received`,
        type: "order",
      },
      ...(domains.length
        ? [
            {
              id: "act-2",
              at: raw.createdAt,
              message: `Domain ${domains[0].domain} added to account`,
              type: "domain" as const,
            },
          ]
        : []),
    ],
    profile: {
      displayName: raw.customer.name.split(/\s+/)[0] || HOSTING_DEMO_USER_NAME,
      twoFactorEnabled: false,
      emailNotifications: true,
      smsNotifications: !!raw.customer.phone,
      marketingEmails: false,
    },
  };
}

export function loadClientAccount(): HostingClientAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOSTING_DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HostingDemoAccount & Partial<HostingClientAccount>;
    if (parsed.profile && parsed.dnsByDomain) {
      return parsed as HostingClientAccount;
    }
    const normalized = normalizeClientAccount(parsed as HostingDemoAccount);
    saveClientAccount(normalized);
    return normalized;
  } catch {
    return null;
  }
}

export function saveClientAccount(account: HostingClientAccount) {
  localStorage.setItem(HOSTING_DEMO_STORAGE_KEY, JSON.stringify(account));
}

export function addActivity(
  account: HostingClientAccount,
  message: string,
  type: HostingClientAccount["activity"][0]["type"]
): HostingClientAccount {
  return {
    ...account,
    activity: [
      {
        id: `act-${Date.now()}`,
        at: new Date().toISOString(),
        message,
        type,
      },
      ...account.activity.slice(0, 19),
    ],
  };
}

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function expiryLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "active";
}
