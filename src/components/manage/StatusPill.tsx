import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  prospect: "bg-sky-50 text-sky-800",
  active: "bg-emerald-50 text-emerald-800",
  completed: "bg-slate-100 text-slate-700",
  archived: "bg-slate-100 text-slate-500",
  inquiry: "bg-sky-50 text-sky-800",
  quoted: "bg-violet-50 text-violet-800",
  in_progress: "bg-amber-50 text-amber-900",
  on_hold: "bg-orange-50 text-orange-800",
  cancelled: "bg-red-50 text-red-700",
};

export function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STYLES[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {label}
    </span>
  );
}
