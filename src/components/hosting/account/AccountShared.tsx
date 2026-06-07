"use client";

import Link from "next/link";
import { Server } from "lucide-react";

export function AccountEmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
      <Server className="mx-auto h-12 w-12 text-slate-300" />
      <h2 className="mt-4 text-xl font-bold text-navy">No hosting account yet</h2>
      <p className="mt-2 text-slate-600">
        Place an order to activate your client account and manage domains, hosting, email, and SSL.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/hosting/domains" className="marketing-btn-primary">
          Buy your own domain name
        </Link>
        <Link href="/hosting/plans" className="marketing-btn-secondary">
          View hosting plans
        </Link>
      </div>
    </div>
  );
}

export function AccountPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-navy md:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    expired: "bg-red-100 text-red-800",
    expiring: "bg-orange-100 text-orange-800",
    suspended: "bg-slate-200 text-slate-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function UsageBar({ used, total, label }: { used: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>
          {used} / {total} GB ({pct}%)
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${pct > 85 ? "bg-red-500" : "bg-royal"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-royal" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
