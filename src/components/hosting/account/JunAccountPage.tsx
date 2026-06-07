"use client";

import Link from "next/link";
import { Bell, CreditCard, Shield, User } from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import { useHostingCurrency } from "@/lib/hosting-currency-context";
import {
  AccountEmptyState,
  AccountPageHeader,
  ToggleSwitch,
} from "@/components/hosting/account/AccountShared";

export function JunAccountPage() {
  const { account, loaded, displayName, updateProfile } = useHostingAccount();
  const { formatPrice } = useHostingCurrency();

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={displayName.toUpperCase()}
        description="Your account hub — billing, security, and notifications"
      />

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-navy to-royal text-2xl font-bold text-white">
          {initial}
        </div>
        <div>
          <p className="text-lg font-bold text-navy">{account.customer.name}</p>
          <p className="text-sm text-slate-600">{account.customer.email}</p>
          <p className="text-xs text-slate-400">Account ID · {account.orderId}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/hosting/dashboard/profile", label: "Profile", icon: User },
          { href: "/hosting/dashboard/expiring", label: "Renewals", icon: CreditCard },
          { href: "/hosting/dashboard/offers", label: "Offers", icon: Bell },
          { href: "/hosting/dashboard/ssl", label: "Security", icon: Shield },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-royal/30"
          >
            <Icon className="h-5 w-5 text-royal" />
            <span className="font-medium text-navy">{label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-navy">Billing summary</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-600">Monthly services</dt>
            <dd className="font-semibold">{formatPrice(account.monthlyTotal, "/mo")}</dd>
          </div>
          <div className="flex justify-between rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-600">Yearly renewals</dt>
            <dd className="font-semibold">{formatPrice(account.yearlyTotal, "/yr")}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-navy">Security & notifications</h2>
        <ul className="mt-4 space-y-4">
          <li className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-navy">Two-factor authentication</p>
              <p className="text-xs text-slate-500">Extra security on login</p>
            </div>
            <ToggleSwitch
              checked={account.profile.twoFactorEnabled}
              onChange={() =>
                updateProfile({ twoFactorEnabled: !account.profile.twoFactorEnabled })
              }
              label="Two-factor authentication"
            />
          </li>
          <li className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-navy">Email notifications</p>
              <p className="text-xs text-slate-500">Renewal and service alerts</p>
            </div>
            <ToggleSwitch
              checked={account.profile.emailNotifications}
              onChange={() =>
                updateProfile({ emailNotifications: !account.profile.emailNotifications })
              }
              label="Email notifications"
            />
          </li>
          <li className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-navy">SMS notifications</p>
              <p className="text-xs text-slate-500">Text alerts to {account.customer.phone || "your phone"}</p>
            </div>
            <ToggleSwitch
              checked={account.profile.smsNotifications}
              onChange={() =>
                updateProfile({ smsNotifications: !account.profile.smsNotifications })
              }
              label="SMS notifications"
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
