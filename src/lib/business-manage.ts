import {
  BUSINESS_DOCUMENT_PACKAGES,
  BUSINESS_REGISTRATION_PACKAGES,
  SERVICES,
  type ServiceSlug,
} from "@/lib/site-content";

export const CLIENT_STATUSES = [
  { id: "prospect", label: "Prospect" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
] as const;

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

export type PaymentPlan = "deposit_60" | "full_100";

export const PAYMENT_PLANS: { id: PaymentPlan; label: string }[] = [
  { id: "deposit_60", label: "60% deposit now — 40% balance on completion" },
  { id: "full_100", label: "100% full payment upfront" },
];

export function getServiceOptions() {
  return SERVICES.map((s) => ({
    slug: s.slug as ServiceSlug,
    title: s.title,
  }));
}

export function getPackageOptions() {
  return [
    ...BUSINESS_REGISTRATION_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Registration",
    })),
    ...BUSINESS_DOCUMENT_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      group: "Documents",
    })),
  ];
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
