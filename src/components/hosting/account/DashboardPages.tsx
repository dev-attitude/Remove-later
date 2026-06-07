"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ExternalLink,
  Globe,
  Mail,
  Server,
  Shield,
} from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import { daysUntil, expiryLabel } from "@/lib/hosting-account-store";
import { useHostingCurrency } from "@/lib/hosting-currency-context";
import {
  AccountEmptyState,
  AccountPageHeader,
  StatusBadge,
  UsageBar,
} from "@/components/hosting/account/AccountShared";

export function DashboardPage() {
  const { account, loaded } = useHostingAccount();
  const { formatPrice } = useHostingCurrency();
  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const doneSteps = account.provisioningSteps.filter((s) => s.done).length;
  const expiringCount = [
    ...account.domains.map((d) => ({ expiresAt: d.expiresAt })),
    ...account.ssl.map((s) => ({ expiresAt: s.expiresAt })),
  ].filter((x) => expiryLabel(x.expiresAt) === "expiring").length;

  const host = account.hostingServices[0];

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title="Dashboard"
        description={`Order ${account.orderId} · Welcome back, ${account.customer.name}`}
        action={
          <a
            href={account.cpanelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="marketing-btn-primary inline-flex text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open cPanel
          </a>
        }
      />

      {expiringCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">
              {expiringCount} item{expiringCount > 1 ? "s" : ""} expiring within 30 days
            </p>
            <Link href="/hosting/dashboard/expiring" className="text-sm font-medium text-amber-800 underline">
              Review expiring services
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Domains", value: account.domains.length, icon: Globe, href: "/hosting/dashboard/domains" },
          { label: "Hosting", value: account.hostingServices.length, icon: Server, href: "/hosting/dashboard/hosting" },
          { label: "Private email", value: account.emails.length, icon: Mail, href: "/hosting/dashboard/email" },
          { label: "SSL certificates", value: account.ssl.length, icon: Shield, href: "/hosting/dashboard/ssl" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-royal/30"
          >
            <Icon className="h-6 w-6 text-royal" />
            <p className="mt-3 text-2xl font-bold text-navy">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-bold text-navy">Recent activity</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {account.activity.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(a.at).toLocaleDateString()}
                </span>
                <span className="text-slate-700">{a.message}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-navy">Billing</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Monthly</dt>
              <dd className="font-semibold">{formatPrice(account.monthlyTotal, "/mo")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Yearly</dt>
              <dd className="font-semibold">{formatPrice(account.yearlyTotal, "/yr")}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-navy">Provisioning</h2>
          <p className="mt-1 text-sm text-slate-500">
            {doneSteps} of {account.provisioningSteps.length} steps complete
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${(doneSteps / account.provisioningSteps.length) * 100}%`,
              }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {account.provisioningSteps.map((step) => (
              <li key={step.stepKey} className="flex items-center gap-2 text-sm">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
                {step.title}
              </li>
            ))}
          </ul>
        </div>

        {host && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-navy">{host.planName}</h2>
            <p className="text-sm text-slate-500">{host.primaryDomain}</p>
            <div className="mt-4 space-y-4">
              <UsageBar used={host.diskUsedGb} total={host.diskTotalGb} label="Disk" />
              <UsageBar used={host.bandwidthUsedGb} total={host.bandwidthTotalGb} label="Bandwidth" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ExpiringPage() {
  const { account, loaded, renewDomain, reissueSsl } = useHostingAccount();
  const [tab, setTab] = useState<"all" | "expiring" | "expired">("all");

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const items = [
    ...account.domains.map((d) => ({
      id: `d-${d.domain}`,
      name: d.domain,
      type: "Domain" as const,
      expiresAt: d.expiresAt,
      onRenew: () => renewDomain(d.domain),
    })),
    ...account.ssl.map((s) => ({
      id: `s-${s.domain}`,
      name: s.domain,
      type: "SSL" as const,
      expiresAt: s.expiresAt,
      onRenew: () => reissueSsl(s.domain),
    })),
  ].filter((item) => {
    const label = expiryLabel(item.expiresAt);
    if (tab === "expiring") return label === "expiring";
    if (tab === "expired") return label === "expired";
    return label === "expiring" || label === "expired";
  });

  return (
    <div>
      <AccountPageHeader
        title="Expiring / Expired"
        description="Renew domains and SSL certificates before they lapse"
      />
      <div className="mb-4 flex gap-2">
        {(["all", "expiring", "expired"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-royal text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {t === "all" ? "Expiring & expired" : t}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <p className="p-8 text-center text-slate-600">No expiring or expired items right now.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const label = expiryLabel(item.expiresAt);
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-navy">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(item.expiresAt).toLocaleDateString()} ({daysUntil(item.expiresAt)}d)
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={label} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={item.onRenew}
                        className="text-sm font-semibold text-royal hover:underline"
                      >
                        Renew
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
