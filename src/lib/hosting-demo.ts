import {
  HOSTING_OFFERINGS,
  HOSTING_WEBSITE_PLANS,
  type BusinessPackage,
} from "@/lib/site-content";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

/** Supported TLDs for demo domain search (NAD/year) */
export const HOSTING_TLDS = [
  { ext: ".com", price: 450, label: ".com" },
  { ext: ".com.na", price: 1650, label: ".com.na" },
  { ext: ".org", price: 500, label: ".org" },
  { ext: ".net", price: 550, label: ".net" },
  { ext: ".co.za", price: 250, label: ".co.za" },
  { ext: ".africa", price: 650, label: ".africa" },
] as const;

export type HostingCartItemType = "domain" | "plan" | "addon";

export type HostingCartItem = {
  lineId: string;
  type: HostingCartItemType;
  catalogId: string;
  name: string;
  price: number;
  currency: "NAD";
  period: "month" | "year" | "once";
  domain?: string;
};

export type DomainSearchResult = {
  domain: string;
  available: boolean;
  priceNad: number;
  premium?: boolean;
};

export type HostingDemoAccount = {
  orderId: string;
  customer: { name: string; email: string; phone: string };
  createdAt: string;
  plan: BusinessPackage | null;
  addons: BusinessPackage[];
  domains: { domain: string; status: "active" | "pending"; expiresAt: string }[];
  emails: { address: string; storageUsed: string; quota: string }[];
  databases: { name: string; size: string; engine: string }[];
  ssl: { domain: string; status: "active" | "pending"; expiresAt: string }[];
  cpanelUrl: string;
  provisioningSteps: { stepKey: string; title: string; done: boolean }[];
  monthlyTotal: number;
  yearlyTotal: number;
};

export const HOSTING_DEMO_STORAGE_KEY = "skyrapay-hosting-demo-account";
export const HOSTING_CART_STORAGE_KEY = "skyrapay-hosting-cart";

export function getAllHostingPackages(): BusinessPackage[] {
  return [...HOSTING_WEBSITE_PLANS, ...HOSTING_OFFERINGS];
}

export function getHostingPackageById(id: string): BusinessPackage | undefined {
  return getAllHostingPackages().find((p) => p.id === id);
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Deterministic demo availability — replaces Namecheap API until live */
export function searchDomainsDemo(query: string): DomainSearchResult[] {
  const base = query
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/[^a-z0-9-]/g, "");

  if (!base || base.length < 2) return [];

  return HOSTING_TLDS.map(({ ext, price }) => {
    const domain = `${base}${ext}`;
    const h = hashString(domain);
    const available = h % 5 !== 0;
    const premium = h % 17 === 0;
    return {
      domain,
      available,
      priceNad: premium ? Math.round(price * 2.5) : price,
      premium,
    };
  });
}

export function cartItemFromDomain(result: DomainSearchResult): HostingCartItem {
  return {
    lineId: `domain-${result.domain}`,
    type: "domain",
    catalogId: "hosting-domain",
    name: result.domain,
    price: result.priceNad,
    currency: "NAD",
    period: "year",
    domain: result.domain,
  };
}

export function cartItemFromPackage(pkg: BusinessPackage, type: "plan" | "addon"): HostingCartItem {
  const period =
    pkg.priceLabel?.toLowerCase().includes("year") || pkg.id === "hosting-domain"
      ? "year"
      : pkg.price === 0
        ? "once"
        : "month";
  return {
    lineId: `${type}-${pkg.id}`,
    type,
    catalogId: pkg.id,
    name: pkg.name,
    price: pkg.price,
    currency: "NAD",
    period,
  };
}

export function computeCartTotals(items: HostingCartItem[]) {
  let monthly = 0;
  let yearly = 0;
  let once = 0;
  for (const item of items) {
    if (item.period === "month") monthly += item.price;
    else if (item.period === "year") yearly += item.price;
    else once += item.price;
  }
  return { monthly, yearly, once, firstInvoice: monthly + yearly + once };
}

export function formatHostingPeriod(period: HostingCartItem["period"]) {
  if (period === "month") return "/mo";
  if (period === "year") return "/yr";
  return "";
}

export function buildDemoAccount(
  orderId: string,
  customer: { name: string; email: string; phone: string },
  cart: HostingCartItem[]
): HostingDemoAccount {
  const planItem = cart.find((i) => i.type === "plan");
  const plan = planItem ? getHostingPackageById(planItem.catalogId) ?? null : null;
  const addons = cart
    .filter((i) => i.type === "addon")
    .map((i) => getHostingPackageById(i.catalogId))
    .filter(Boolean) as BusinessPackage[];

  const domainItems = cart.filter((i) => i.type === "domain");
  const primaryDomain = domainItems[0]?.domain ?? "yourdomain.com";
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const { monthly, yearly } = computeCartTotals(cart);

  return {
    orderId,
    customer,
    createdAt: new Date().toISOString(),
    plan,
    addons,
    domains: domainItems.map((d) => ({
      domain: d.domain!,
      status: "pending" as const,
      expiresAt: expires.toISOString(),
    })),
    emails: plan
      ? [
          {
            address: `info@${primaryDomain}`,
            storageUsed: "0 MB",
            quota: plan.id === "hosting-starter" ? "500 MB" : "1 GB",
          },
          {
            address: `admin@${primaryDomain}`,
            storageUsed: "0 MB",
            quota: plan.id === "hosting-starter" ? "500 MB" : "1 GB",
          },
        ]
      : [],
    databases: plan
      ? [
          {
            name: `${primaryDomain.split(".")[0]}_wp`,
            size: "0 MB",
            engine: "MySQL 8.0",
          },
        ]
      : [],
    ssl: domainItems.map((d) => ({
      domain: d.domain!,
      status: "pending" as const,
      expiresAt: expires.toISOString(),
    })),
    cpanelUrl: `https://${SKYRAPAY_HOSTING.cpanelHost}:2083`,
    provisioningSteps: [
      { stepKey: "order_received", title: "Order received", done: true },
      { stepKey: "domain_registered", title: "Domain registration", done: false },
      { stepKey: "cpanel_created", title: "cPanel account created", done: false },
      { stepKey: "dns_configured", title: "DNS configured", done: false },
      { stepKey: "ssl_installed", title: "SSL certificate installed", done: false },
      { stepKey: "email_ready", title: "Email accounts ready", done: false },
    ],
    monthlyTotal: monthly,
    yearlyTotal: yearly,
  };
}

export function generateOrderId() {
  return `SH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
