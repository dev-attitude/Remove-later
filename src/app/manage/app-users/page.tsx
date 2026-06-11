"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/manage/StatusPill";

type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  portal: string;
  createdAt: string;
  subscription: {
    tierId: string;
    status: string;
    portal: string;
    currentPeriodEnd: string | null;
    stripeSubscriptionId: string | null;
  } | null;
  usageCount: number;
  lastActive: string | null;
  campusMemberships: number;
};

type Data = {
  summary: {
    total: number;
    activeSubscriptions: number;
    payingSubscriptions: number;
    byPortal: Record<string, number>;
  };
  users: AppUser[];
};

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ManageAppUsersPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/manage/app-users")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading app users…</p>;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? data.users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name ?? "").toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.portal.toLowerCase().includes(q)
      )
    : data.users;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Research App users
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Every registered account, their subscription, and how much they use the platform.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Registered users</p>
          <p className="mt-2 text-2xl font-bold">{data.summary.total}</p>
          <p className="mt-1 text-xs text-slate-500">
            {Object.entries(data.summary.byPortal)
              .map(([portal, n]) => `${n} ${portal}`)
              .join(" · ")}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Active subscriptions</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {data.summary.activeSubscriptions}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Paying (Stripe)</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {data.summary.payingSubscriptions}
          </p>
          <p className="mt-1 text-xs text-slate-500">Others are trials or complimentary</p>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email, name, role, or portal…"
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role / portal</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3">Renews / ends</th>
                <th className="px-4 py-3 text-right">Usage actions</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{u.name ?? "—"}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{u.role}</p>
                    <p className="text-xs text-slate-500">
                      {u.portal}
                      {u.campusMemberships > 0 && ` · ${u.campusMemberships} campus`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {u.subscription ? (
                      <div className="flex flex-col gap-1">
                        <StatusPill
                          status={u.subscription.status}
                          label={u.subscription.status}
                        />
                        <span className="text-xs text-slate-500">
                          {u.subscription.tierId}
                          {u.subscription.stripeSubscriptionId ? " · Stripe" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {fmtDate(u.subscription?.currentPeriodEnd ?? null)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {u.usageCount}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(u.lastActive)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
