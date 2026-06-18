"use client";

import { Loader2 } from "lucide-react";

export function AIOutput({
  loading,
  content,
  mode,
  label = "AI output",
  statusLabel,
}: {
  loading: boolean;
  content: string;
  mode?: "demo" | "live" | null;
  label?: string;
  /** Overrides default Live AI / Demo badge text */
  statusLabel?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-8 text-brand-700">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Skyrapay AI is generating…</span>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="rounded-lg border border-line bg-cream-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {label}
        </p>
        {mode && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              mode === "live"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {statusLabel ?? (mode === "live" ? "Live AI" : "Demo")}
          </span>
        )}
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-charcoal">
        {content}
      </pre>
    </div>
  );
}
