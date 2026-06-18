"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Globe, Mail, Plus, Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/manage/StatusPill";
import {
  clientStatusLabel,
  engagementStatusLabel,
  formatNad,
  serviceLabel,
} from "@/lib/business-manage";

type HostingOrder = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  itemsJson: string | null;
  totalNad: number | null;
  orderRef: string | null;
  status: string;
  createdAt: string;
};

type HostingClient = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  _count: { engagements: number; income: number };
  engagements: Array<{ id: string; title: string; status: string; progressPercent: number }>;
};

type HostingEngagement = {
  id: string;
  title: string;
  status: string;
  progressPercent: number;
  packageId: string | null;
  serviceSlug: string;
  quotedAmount: number | null;
  client: { id: string; name: string; company: string | null };
};

type Data = {
  summary: {
    totalOrders: number;
    newOrders: number;
    inProgressOrders: number;
    hostingClients: number;
    activeClients: number;
    activeWork: number;
    estimatedMrr: number;
  };
  orders: HostingOrder[];
  clients: HostingClient[];
  engagements: HostingEngagement[];
};

type Tab = "orders" | "clients" | "work";

function fmtDateTime(value: string) {
  return new Date(value).toLocaleString("en-NA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseItems(json: string | null): { name: string; price: number; period?: string }[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export default function ManageHostingPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("orders");

  const load = useCallback(() => {
    fetch("/api/manage/hosting")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function setOrderStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/manage/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  if (error && !data) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading hosting services…</p>;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "orders", label: "Hosting orders", count: data.orders.length },
    { id: "clients", label: "Hosting clients", count: data.clients.length },
    { id: "work", label: "Active work", count: data.engagements.length },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
            Hosting services
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage client domains, hosting plans, migrations, and provisioning — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/manage/clients?category=hosting-web"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-charcoal hover:bg-cream-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add hosting client
          </Link>
          <Link
            href="/hosting"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-offwhite hover:bg-brand-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Public hosting page
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="!p-4">
          <p className="text-xs text-muted">New orders</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              data.summary.newOrders > 0 ? "text-amber-600" : "text-charcoal"
            }`}
          >
            {data.summary.newOrders}
          </p>
          <p className="mt-1 text-xs text-muted">{data.summary.totalOrders} total orders</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-muted">Hosting clients</p>
          <p className="mt-2 text-2xl font-bold">{data.summary.hostingClients}</p>
          <p className="mt-1 text-xs text-muted">{data.summary.activeClients} active</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-muted">Work in progress</p>
          <p className="mt-2 text-2xl font-bold text-sky-700">{data.summary.activeWork}</p>
          <p className="mt-1 text-xs text-muted">Setup, migration & support jobs</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-muted">Est. monthly from orders</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {formatNad(data.summary.estimatedMrr)}
          </p>
          <p className="mt-1 text-xs text-muted">From plan lines in submitted carts</p>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-brand-600 text-offwhite"
                : "bg-line text-muted hover:bg-line"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-3">
          {data.orders.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">
                No hosting orders yet. When a client checks out on{" "}
                <Link href="/hosting" className="text-brand-700 underline">
                  /hosting
                </Link>
                , their order appears here automatically.
              </p>
            </Card>
          ) : (
            data.orders.map((order) => {
              const items = parseItems(order.itemsJson);
              return (
                <Card key={order.id} className="!p-0 overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Server className="h-4 w-4 text-brand-600" />
                        <p className="font-semibold text-charcoal">{order.name}</p>
                        <StatusPill status={order.status} label={order.status.replace("_", " ")} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {order.email}
                        {order.phone ? ` · ${order.phone}` : ""}
                        {order.orderRef ? ` · ${order.orderRef}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{fmtDateTime(order.createdAt)}</p>
                    </div>
                    {order.totalNad != null && order.totalNad > 0 && (
                      <p className="text-lg font-bold text-charcoal">
                        {formatNad(order.totalNad)}
                      </p>
                    )}
                  </div>
                  {items.length > 0 && (
                    <ul className="border-t border-line bg-cream-50/50 px-5 py-3 text-sm">
                      {items.map((item, i) => (
                        <li key={i} className="flex justify-between py-0.5 text-charcoal">
                          <span>{item.name}</span>
                          <span className="font-medium">
                            {formatNad(item.price)}
                            {item.period === "month"
                              ? "/mo"
                              : item.period === "year"
                                ? "/yr"
                                : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {order.message && (
                    <p className="border-t border-line px-5 py-2 text-xs text-muted">
                      Notes: {order.message}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
                    {order.status !== "in_progress" && (
                      <button
                        type="button"
                        onClick={() => setOrderStatus(order.id, "in_progress")}
                        className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-offwhite hover:bg-sky-700"
                      >
                        Mark provisioning
                      </button>
                    )}
                    {order.status !== "resolved" && (
                      <button
                        type="button"
                        onClick={() => setOrderStatus(order.id, "resolved")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-offwhite hover:bg-emerald-700"
                      >
                        Mark live
                      </button>
                    )}
                    <a
                      href={`mailto:${order.email}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-cream-50"
                    >
                      <Mail className="h-3 w-3" />
                      Email client
                    </a>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "clients" && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.clients.length === 0 ? (
            <Card className="md:col-span-2">
              <p className="text-sm text-muted">
                No hosting clients yet. Add a client under{" "}
                <strong>Hosting & Website</strong> category, or convert an order once provisioned.
              </p>
              <Link
                href="/manage/clients"
                className="mt-3 inline-block text-sm font-semibold text-brand-700 underline"
              >
                Go to Clients →
              </Link>
            </Card>
          ) : (
            data.clients.map((c) => (
              <Link key={c.id} href={`/manage/clients/${c.id}`}>
                <Card className="h-full transition hover:border-brand-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 font-semibold text-charcoal">
                        <Globe className="h-4 w-4 text-brand-600" />
                        {c.name}
                      </p>
                      {c.company && <p className="text-sm text-muted">{c.company}</p>}
                    </div>
                    <StatusPill status={c.status} label={clientStatusLabel(c.status)} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {[c.email, c.phone].filter(Boolean).join(" · ") || "No contact details"}
                  </p>
                  <p className="mt-3 text-xs font-medium text-muted">
                    {c._count.engagements} service(s) · {c._count.income} payment(s)
                  </p>
                  {c.engagements[0] && (
                    <p className="mt-1 text-xs text-brand-700">
                      Latest: {c.engagements[0].title} ({c.engagements[0].progressPercent}%)
                    </p>
                  )}
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "work" && (
        <div className="space-y-3">
          {data.engagements.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">
                No hosting service work tracked yet. Open a hosting client and start a service
                (migration, setup, maintenance) to track progress here.
              </p>
            </Card>
          ) : (
            data.engagements.map((e) => (
              <Link key={e.id} href={`/manage/services/${e.id}`}>
                <Card className="transition hover:border-brand-200 hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-charcoal">{e.title}</p>
                      <p className="text-xs text-muted">
                        {e.client.name}
                        {e.client.company ? ` · ${e.client.company}` : ""} ·{" "}
                        {serviceLabel(e.serviceSlug)}
                        {e.packageId ? ` · ${e.packageId}` : ""}
                      </p>
                    </div>
                    <StatusPill status={e.status} label={engagementStatusLabel(e.status)} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${e.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted">{e.progressPercent}%</span>
                    {e.quotedAmount != null && (
                      <span className="text-xs font-semibold text-emerald-700">
                        {formatNad(e.quotedAmount)}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
