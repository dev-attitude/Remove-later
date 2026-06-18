import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  prospect: "border-sky-200 bg-sky-50 text-sky-800",
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed: "border-line bg-line text-charcoal",
  archived: "border-line bg-line text-muted",
  inquiry: "border-sky-200 bg-sky-50 text-sky-800",
  quoted: "border-violet-200 bg-violet-50 text-violet-800",
  in_progress: "border-amber-200 bg-amber-50 text-amber-900",
  on_hold: "border-orange-200 bg-orange-50 text-orange-800",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  pending: "border-line bg-line text-charcoal",
  partial: "border-amber-200 bg-amber-50 text-amber-900",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  overdue: "border-red-200 bg-red-50 text-red-800",
  sent: "border-brand-200 bg-brand-50 text-brand-800",
  draft: "border-line bg-cream-50 text-muted",
};

export function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        STYLES[status] ?? "border-line bg-line text-charcoal"
      )}
    >
      {label}
    </span>
  );
}
