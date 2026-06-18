"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { ManageStatCard } from "@/components/manage/ManageStatCard";
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
  hosting: { orders: number; clients: number };
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

function TodoSummaryCard() {
  const [summary, setSummary] = useState<{ open: number; overdue: number; dueToday: number } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/manage/todos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSummary(d?.summary ?? null))
      .catch(() => null);
  }, []);

  if (!summary) {
    return <ManageStatCard label="To-do & planning" value="—" />;
  }

  const tone =
    summary.overdue > 0 ? "danger" : summary.dueToday > 0 ? "warning" : ("default" as const);

  return (
    <ManageStatCard
      label="To-do & planning"
      value={summary.open}
      tone={tone}
      href="/manage/todos"
      hint={
        summary.overdue > 0
          ? `${summary.overdue} overdue`
          : summary.dueToday > 0
            ? `${summary.dueToday} due today`
            : "All caught up"
      }
    />
  );
}

function StaleRegistrationsCard() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/manage/registration-reminders")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCount(d?.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  if (count === null) {
    return <ManageStatCard label="Stale registrations (3+ days)" value="—" />;
  }

  return (
    <ManageStatCard
      label="Stale registrations (3+ days)"
      value={count}
      tone={count > 0 ? "warning" : "success"}
      href="/manage/services"
      hint={count > 0 ? "Auto-reminders + admin digest" : "All registrations up to date"}
    />
  );
}

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
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted">Loading dashboard…</p>;
  }

  const { clients, engagements, finances, recentEngagements } = data;
  const monthLabel = new Date().toLocaleString("en-NA", { month: "long", year: "numeric" });

  return (
    <div>
      <ManagePageHeader
        title="Master overview"
        description={`All services and all clients in one place — business work, Research App, and SmartCampus for ${monthLabel}.`}
      />

      {master && (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ManageStatCard
            label="New orders & inquiries"
            value={master.support.newInquiries}
            tone={master.support.newInquiries > 0 ? "warning" : "default"}
            href="/manage/inquiries"
            hint="Hosting, shop, IT services & contact"
          />
          <ManageStatCard
            label="Technical errors (7 days)"
            value={master.support.errors7}
            tone={master.support.errors7 > 0 ? "danger" : "success"}
            href="/manage/errors"
            hint={master.support.errors7 === 0 ? "All systems healthy" : "Click to investigate"}
          />
          <ManageStatCard
            label="Hosting services"
            value={master.hosting.clients}
            href="/manage/hosting"
            hint={`${master.hosting.orders} order(s) · domains & plans`}
          />
          <ManageStatCard
            label="Research App users"
            value={master.research.users}
            href="/manage/app-users"
            hint={`+${master.research.newUsers30} in last 30 days`}
          />
          <ManageStatCard
            label="Active subscriptions"
            value={master.research.activeSubscriptions}
            tone="success"
            href="/manage/app-users"
            hint={`${master.research.payingSubscriptions} paying via Stripe`}
          />
          <ManageStatCard
            label="App activity (30 days)"
            value={master.research.usageActions30}
            href="/manage/usage"
            hint={`${master.research.platformBooks} platform textbooks loaded`}
          />
          <ManageStatCard
            label="SmartCampus"
            value={master.campus.tenants}
            href="/campus/admin"
            hint={`institutions · ${master.campus.students} students`}
          />
        </div>
      )}

      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
        Consulting & services business
      </h2>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <ManageStatCard
          label="Clients"
          value={clients.total}
          href="/manage/clients"
          hint={`${clients.byStatus.active ?? 0} active · ${clients.byStatus.prospect ?? 0} prospects`}
        />
        <TodoSummaryCard />
        <ManageStatCard
          label="Services in progress"
          value={engagements.inProgress}
          href="/manage/services"
          hint={`${engagements.total} total engagements`}
        />
        <StaleRegistrationsCard />
        <ManageStatCard
          label="Income (this month)"
          value={formatNad(finances.incomeMtd)}
          tone="success"
          href="/manage/income"
        />
        <ManageStatCard
          label="Net (this month)"
          value={formatNad(finances.netMtd)}
          tone={finances.netMtd >= 0 ? "success" : "danger"}
          hint={`Expenses ${formatNad(finances.expenseMtd)}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="manage">
          <CardTitle>Recent service work</CardTitle>
          {recentEngagements.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No services yet.{" "}
              <Link href="/manage/clients" className="font-medium text-brand-700 hover:underline">
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
                    className="block rounded-lg border border-line/80 p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-charcoal">{e.title}</p>
                      <StatusPill
                        status={e.status}
                        label={engagementStatusLabel(e.status)}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {e.client.name}
                      {e.client.company ? ` · ${e.client.company}` : ""} ·{" "}
                      {serviceLabel(e.serviceSlug)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${e.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted">
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

        <Card variant="manage">
          <CardTitle>All-time finances</CardTitle>
          <dl className="mt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Total income</dt>
              <dd className="font-semibold tabular-nums text-emerald-700">
                {formatNad(finances.incomeAllTime)}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Total expenses</dt>
              <dd className="font-semibold tabular-nums text-red-600">
                {formatNad(finances.expenseAllTime)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-sm">
              <dt className="font-medium text-charcoal">Net profit</dt>
              <dd className="font-bold tabular-nums text-charcoal">
                {formatNad(finances.incomeAllTime - finances.expenseAllTime)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/manage/income"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-offwhite shadow-sm transition hover:bg-emerald-700"
            >
              Record income
            </Link>
            <Link
              href="/manage/expenses"
              className="rounded-lg border border-line bg-offwhite px-3 py-2 text-xs font-semibold text-charcoal shadow-sm transition hover:bg-cream-50"
            >
              Record expense
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
