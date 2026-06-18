import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneMap = {
  default: "bg-offwhite text-charcoal",
  success: "bg-emerald-50 text-emerald-900",
  warning: "bg-amber-50 text-amber-900",
  danger: "bg-rose-50 text-rose-900",
};

export function CampusMetricCard({ label, value, sub, icon: Icon, tone = "default" }: Props) {
  return (
    <div className={clsx("rounded-xl border border-line p-4", toneMap[tone])}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        <div className="rounded-lg bg-offwhite/80 p-2 shadow-sm">
          <Icon className="h-5 w-5 text-muted" />
        </div>
      </div>
    </div>
  );
}
