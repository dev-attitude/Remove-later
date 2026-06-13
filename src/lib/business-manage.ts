import {
  ASSIGNMENT_WRITING_PACKAGES,
  BUSINESS_DOCUMENT_PACKAGES,
  BUSINESS_REGISTRATION_PACKAGES,
  RESEARCH_WRITING_PACKAGES,
  HOSTING_OFFERINGS,
  HOSTING_WEBSITE_PLANS,
  SERVICES,
  type ServiceSlug,
} from "@/lib/site-content";

export const CLIENT_STATUSES = [
  { id: "prospect", label: "Prospect" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
] as const;

/** Which side of the business a client belongs to — keeps each client list in its own lane */
export const CLIENT_CATEGORIES = [
  { id: "hosting-web", label: "Hosting & Website" },
  { id: "research-app", label: "Research App" },
  { id: "student-writing", label: "Assignment & Research Writing" },
  { id: "business-consulting", label: "Business Consultations" },
  { id: "registration", label: "Business Registration & Compliance" },
  { id: "it-support", label: "IT Support & Repairs" },
  { id: "campus", label: "SmartCampus / Institutions" },
  { id: "general", label: "General / Other" },
] as const;

export type ClientCategoryId = (typeof CLIENT_CATEGORIES)[number]["id"];

export function clientCategoryLabel(category: string) {
  return CLIENT_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export const ENGAGEMENT_STATUSES = [
  { id: "inquiry", label: "Inquiry" },
  { id: "quoted", label: "Quoted" },
  { id: "in_progress", label: "In progress" },
  { id: "on_hold", label: "On hold" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export const INCOME_CATEGORIES = [
  { id: "service_payment", label: "Service payment" },
  { id: "deposit", label: "Deposit" },
  { id: "retainer", label: "Retainer" },
  { id: "other", label: "Other" },
] as const;

export const EXPENSE_CATEGORIES = [
  { id: "filing_fees", label: "Filing & registration fees" },
  { id: "travel", label: "Travel" },
  { id: "software", label: "Software & subscriptions" },
  { id: "subcontractor", label: "Subcontractor / freelancer" },
  { id: "office", label: "Office & supplies" },
  { id: "marketing", label: "Marketing" },
  { id: "other", label: "Other" },
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "EFT / Bank transfer",
  "Card",
  "Mobile money",
  "Other",
] as const;

export type PaymentPlan = "deposit_50" | "deposit_60" | "full_100";

export const PAYMENT_PLANS: { id: PaymentPlan; label: string }[] = [
  { id: "deposit_50", label: "50% deposit now — 50% balance on completion" },
  { id: "deposit_60", label: "60% deposit now — 40% balance on completion" },
  { id: "full_100", label: "100% full payment upfront" },
];

export function isDepositPaymentPlan(plan: PaymentPlan): boolean {
  return plan === "deposit_50" || plan === "deposit_60";
}

export function paymentPlanScheduleLabel(plan: PaymentPlan): string {
  if (plan === "full_100") return "100% upfront";
  if (plan === "deposit_50") return "50% deposit, then 50% balance when all steps are complete";
  return "60% deposit, then 40% balance when all steps are complete";
}

export function getServiceOptions() {
  return SERVICES.map((s) => ({
    slug: s.slug as ServiceSlug,
    title: s.title,
  }));
}

/** Ongoing PhD monthly retainer — auto-invoiced on the 1st of each month */
export const PHD_MONTHLY_PACKAGE_ID = "research-phd-monthly";

export type PackageOption = {
  id: string;
  name: string;
  price: number;
  group: string;
  serviceSlug?: ServiceSlug;
};

const PACKAGE_SERVICE_MAP: Record<string, ServiceSlug> = {
  ...Object.fromEntries(
    ASSIGNMENT_WRITING_PACKAGES.map((p) => [p.id, "assignment-writing" as ServiceSlug])
  ),
  ...Object.fromEntries(
    RESEARCH_WRITING_PACKAGES.map((p) => [p.id, "research-writing" as ServiceSlug])
  ),
  ...Object.fromEntries(
    BUSINESS_REGISTRATION_PACKAGES.map((p) => [p.id, "business-consulting" as ServiceSlug])
  ),
  ...Object.fromEntries(
    BUSINESS_DOCUMENT_PACKAGES.map((p) => [p.id, "business-consulting" as ServiceSlug])
  ),
};

export function serviceSlugForPackage(packageId: string): ServiceSlug | undefined {
  return PACKAGE_SERVICE_MAP[packageId];
}

export function getPackageOptions(serviceSlug?: string): PackageOption[] {
  const all: PackageOption[] = [
    ...ASSIGNMENT_WRITING_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Assignment writing",
      serviceSlug: "assignment-writing" as ServiceSlug,
    })),
    ...RESEARCH_WRITING_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Research writing",
      serviceSlug: "research-writing" as ServiceSlug,
    })),
    ...BUSINESS_REGISTRATION_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Registration",
      serviceSlug: "business-consulting" as ServiceSlug,
    })),
    ...BUSINESS_DOCUMENT_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Documents",
      serviceSlug: "business-consulting" as ServiceSlug,
    })),
    ...HOSTING_WEBSITE_PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Hosting plans",
      serviceSlug: "web-app-development" as ServiceSlug,
    })),
    ...HOSTING_OFFERINGS.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Hosting services",
      serviceSlug: "web-app-development" as ServiceSlug,
    })),
  ];
  if (serviceSlug) {
    return all.filter((p) => p.serviceSlug === serviceSlug);
  }
  return all;
}

export function serviceLabel(slug: string) {
  return SERVICES.find((s) => s.slug === slug)?.title ?? slug;
}

export function engagementStatusLabel(status: string) {
  return ENGAGEMENT_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function clientStatusLabel(status: string) {
  return CLIENT_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function formatNad(amount: number) {
  return `N$ ${amount.toLocaleString("en-NA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function computeProgressFromTasks(tasks: { done: boolean }[]) {
  if (tasks.length === 0) return null;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}
