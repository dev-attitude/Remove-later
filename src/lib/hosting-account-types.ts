import type { BusinessPackage } from "@/lib/site-content";

export type DomainRecord = {
  domain: string;
  status: "active" | "pending" | "expired";
  expiresAt: string;
  autoRenew: boolean;
  privacy: boolean;
  registrar: string;
};

export type DnsRecord = {
  id: string;
  type: "A" | "CNAME" | "MX" | "TXT";
  host: string;
  value: string;
  ttl: number;
};

export type EmailMailbox = {
  id: string;
  address: string;
  storageUsedMb: number;
  quotaMb: number;
  forwarding?: string;
  createdAt: string;
};

export type DatabaseRecord = {
  id: string;
  name: string;
  sizeMb: number;
  engine: string;
  users: number;
};

export type SslRecord = {
  domain: string;
  status: "active" | "pending" | "expired";
  expiresAt: string;
  type: "AutoSSL" | "PositiveSSL";
  autoRenew: boolean;
};

export type HostingServiceRecord = {
  id: string;
  planName: string;
  primaryDomain: string;
  status: "active" | "pending" | "suspended";
  diskUsedGb: number;
  diskTotalGb: number;
  bandwidthUsedGb: number;
  bandwidthTotalGb: number;
  phpVersion: string;
  backupSchedule: "weekly" | "daily" | "none";
};

export type InstalledApp = {
  id: string;
  appId: string;
  name: string;
  domain: string;
  version: string;
  installedAt: string;
};

export type GrowthToolId = "logo-maker" | "business-card" | "site-maker" | "social-kit";

export type OfferRecord = {
  id: string;
  title: string;
  detail: string;
  discount: string;
  expiresAt: string;
  redeemed: boolean;
};

export type ActivityItem = {
  id: string;
  at: string;
  message: string;
  type: "order" | "domain" | "email" | "ssl" | "hosting" | "app";
};

export type AccountProfile = {
  displayName: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
};

export type HostingClientAccount = {
  orderId: string;
  customer: { name: string; email: string; phone: string };
  createdAt: string;
  plan: BusinessPackage | null;
  addons: BusinessPackage[];
  domains: DomainRecord[];
  dnsByDomain: Record<string, DnsRecord[]>;
  emails: EmailMailbox[];
  databases: DatabaseRecord[];
  ssl: SslRecord[];
  hostingServices: HostingServiceRecord[];
  installedApps: InstalledApp[];
  offers: OfferRecord[];
  growthToolsUsed: GrowthToolId[];
  cpanelUrl: string;
  provisioningSteps: { stepKey: string; title: string; done: boolean }[];
  monthlyTotal: number;
  yearlyTotal: number;
  activity: ActivityItem[];
  profile: AccountProfile;
};

export const AVAILABLE_APPS = [
  { id: "wordpress", name: "WordPress", desc: "Blog & business websites", version: "6.5" },
  { id: "joomla", name: "Joomla", desc: "CMS & portals", version: "5.1" },
  { id: "phpmyadmin", name: "phpMyAdmin", desc: "MySQL management", version: "5.2" },
  { id: "roundcube", name: "Roundcube Webmail", desc: "Browser email", version: "1.6" },
  { id: "prestashop", name: "PrestaShop", desc: "Online store", version: "8.1" },
  { id: "laravel", name: "Laravel", desc: "PHP application framework", version: "11" },
] as const;

export const GROWTH_TOOLS = [
  { id: "logo-maker" as const, name: "Logo Maker", desc: "Design a professional logo for your brand" },
  { id: "business-card" as const, name: "Business Card Maker", desc: "Print-ready business card layouts" },
  { id: "site-maker" as const, name: "Site Maker", desc: "One-page website on your domain" },
  { id: "social-kit" as const, name: "Social Media Kit", desc: "Banners and posts for social platforms" },
] as const;

export const DEFAULT_OFFERS: Omit<OfferRecord, "redeemed">[] = [
  {
    id: "offer-annual-20",
    title: "20% off annual hosting",
    detail: "Pay yearly on Business or Premium and save 20% on your first year.",
    discount: "20% off",
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
  },
  {
    id: "offer-free-domain",
    title: "Free .com domain with Premium",
    detail: "Register one .com domain free when you upgrade to Premium hosting.",
    discount: "Free domain",
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
  },
  {
    id: "offer-maintenance",
    title: "50% off maintenance — first month",
    detail: "Try managed website maintenance at half price for your first month.",
    discount: "50% off",
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  },
];
