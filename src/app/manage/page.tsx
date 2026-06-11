"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/manage/StatusPill";
import {
  engagementStatusLabel,
  formatNad,
  serviceLabel,
} from "@/lib/business-manage";

type MasterData = {
  research: {
    users: number;
    newUsers30: number;
    activeSubscriptions: number;
    payingSubscriptions: number;
    usageActions30: number;
    platformBooks: number;
  };
  campus: { tenants: number; students: number };
  support: { newInquiries: number; errors7: number };
};

type DashboardData = {
  clients: { total: number; byStatus: Record<string, number> };
  engagements: { total: number; inProgress: number; byStatus: Record<string, number> };
  finances: {
    incomeMtd: number;
    expenseMtd: number;
    netMtd: number;
    incomeAllTime: number;
    expenseAllTime: number;
  };
  recentEngagements: Array<{
    id: string;
    title: string;
    status: string;
    progressPercent: number;
    serviceSlug: string;
    client: { id: string; name: string; company: string | null };
    taskDone: number;
    taskTotal: number;
  }>;
};

export default function ManageOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [master, setMaster] = useState<MasterData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/manage/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));

    fetch("/api/manage/master")
      .then(async (res) => (res.ok ? res.json() : null))
      .then(setMaster)
      .catch(() => null);
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading dashboard…</p>;
  }

  const { clients, engagements, finances, recentEngagements } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Master overview
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          All services and all clients in one place — business work, Research App, and
          SmartCampus for {new Date().toLocaleString("en-NA", { month: "long", year: "numeric" })}
        </p>
      </div>

      {master && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link href="/manage/inquiries" className="block">
            <Card className="!p-4 h-full transition hover:border-brand-300">
              <p className="text-xs text-slate-500">New orders & inquiries</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  master.support.newInquiries > 0 ? "text-amber-600" : "text-slate-900"
                }`}
              >
                {master.support.newInquiries}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hosting, shop, IT services & contact
              </p>
            </Card>
          </Link>
          <Link href="/manage/errors" className="block">
            <Card className="!p-4 h-full transition hover:border-brand-300">
              <p className="text-xs text-slate-500">Technical errors (7 days)</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  master.support.errors7 > 0 ? "text-red-600" : "text-emerald-700"
                }`}
              >
                {master.support.errors7}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {master.support.errors7 === 0 ? "All systems healthy" : "Click to investigate"}
              </p>
            </Card>
          </Link>
          <Link href="/manage/app-users" className="block">
            <Card className="!p-4 h-full transition hover:border-brand-300">
              <p className="text-xs text-slate-500">Research App users</p>
              <p className="mt-2 text-2xl font-bold">{master.research.users}</p>
              <p className="mt-1 text-xs text-slate-500">
                +{master.research.newUsers30} in last 30 days
              </p>
            </Card>
          </Link>
          <Link href="/manage/app-users" className="block">
            <Card className="!p-4 h-full transition hover:border-brand-300">
              <p className="text-xs text-slate-500">Active subscriptions</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {master.research.activeSubscriptions}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {master.research.payingSubscriptions} paying via Stripe
              </p>
            </Card>
          </Link>
          <Link href="/manage/usage" className="block">
            <Card className="!p-4 h-full transition hover:border-brand-300">
              <p className="text-xs text-slate-500">App activity (30 days)</p>
              <p className="mt-2 text-2xl font-bold text-brand-700">
                {master.research.usageActions30}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {master.research.platformBooks} platform textbooks loaded
              </p>
            </Card>
          </Link>
          <Link href="/campus/admin" className="block">
            <Card className="!p-4 h-full transition hover:border-brand-300">
              <p className="text-xs text-slate-500">SmartCampus</p>
              <p className="mt-2 text-2xl font-bold">{master.campus.tenants}</p>
              <p className="mt-1 text-xs text-slate-500">
                institutions · {master.campus.students} students
              </p>
            </Card>
          </Link>
        </div>
      )}

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Consulting & services business
      </h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Clients</p>
          <p className="mt-2 text-2xl font-bold">{clients.total}</p>
          <p className="mt-1 text-xs text-slate-500">
            {clients.byStatus.active ?? 0} active · {clients.byStatus.prospect ?? 0} prospects
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Services in progress</p>
          <p className="mt-2 text-2xl font-bold">{engagements.inProgress}</p>
          <p className="mt-1 text-xs text-slate-500">{engagements.total} total engagements</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Income (this month)</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {formatNad(finances.incomeMtd)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Net (this month)</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              finances.netMtd >= 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {formatNad(finances.netMtd)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Expenses {formatNad(finances.expenseMtd)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Recent service work</CardTitle>
          {recentEngagements.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No services yet.{" "}
              <Link href="/manage/clients" className="text-brand-700 underline">
                Add a client
              </Link>{" "}
              and start tracking their work.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentEngagements.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/manage/services/${e.id}`}
                    className="block rounded-lg border border-slate-200 p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{e.title}</p>
                      <StatusPill
                        status={e.status}
                        label={engagementStatusLabel(e.status)}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {e.client.name}
                      {e.client.company ? ` · ${e.client.company}` : ""} ·{" "}
                      {serviceLabel(e.serviceSlug)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${e.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {e.progressPercent}%
                        {e.taskTotal > 0 && ` (${e.taskDone}/${e.taskTotal} tasks)`}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>All-time finances</CardTitle>
          <dl className="mt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-600">Total income</dt>
              <dd className="font-semibold text-emerald-700">
                {formatNad(finances.incomeAllTime)}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-600">Total expenses</dt>
              <dd className="font-semibold text-red-600">
                {formatNad(finances.expenseAllTime)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-sm">
              <dt className="font-medium text-slate-900">Net profit</dt>
              <dd className="font-bold text-slate-900">
                {formatNad(finances.incomeAllTime - finances.expenseAllTime)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/manage/income"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Record income
            </Link>
            <Link
              href="/manage/expenses"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Record expense
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
