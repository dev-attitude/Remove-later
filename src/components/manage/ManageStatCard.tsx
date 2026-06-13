import Link from "next/link";
import { cn } from "@/lib/utils";

type ManageStatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
};

const TONE_STYLES = {
  default: "border-slate-200/80 bg-white",
  warning: "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white",
  danger: "border-red-200/80 bg-gradient-to-br from-red-50/60 to-white",
  success: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white",
};

const VALUE_TONE = {
  default: "text-slate-900",
  warning: "text-amber-700",
  danger: "text-red-700",
  success: "text-emerald-700",
};

export function ManageStatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
  className,
}: ManageStatCardProps) {
  const inner = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums", VALUE_TONE[tone])}>{value}</p>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </>
  );

  const cardClass = cn(
    "manage-stat-card block h-full transition",
    TONE_STYLES[tone],
    href && "hover:border-brand-300 hover:shadow-md",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
