"use client";

import { Code2, Key, DollarSign, Users, Smartphone, Server } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PORTALS } from "@/lib/portals";
import Link from "next/link";

const REVENUE = [
  { portal: "Institution", mrr: "$24,800", users: 412 },
  { portal: "Student", mrr: "$18,200", users: 1840 },
  { portal: "Analysis", mrr: "$9,400", users: 286 },
];

export default function DeveloperConsoleModule() {
  return (
    <>
      <ModuleHeader
        title="Developer Console"
        description="Platform owner controls: revenue, users, API keys, app releases, and portal configuration."
        icon={Code2}
      />
      <ModuleWorkspace>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total MRR", value: "$52,400", icon: DollarSign },
            { label: "Active users", value: "2,538", icon: Users },
            { label: "API calls (24h)", value: "1.2M", icon: Server },
            { label: "App installs", value: "4,891", icon: Smartphone },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="!p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted">{s.label}</p>
                  <Icon className="h-4 w-4 text-muted" />
                </div>
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
              </Card>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardTitle>Revenue by portal</CardTitle>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted">
                <th className="py-2">Portal</th>
                <th className="py-2">MRR</th>
                <th className="py-2">Users</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE.map((r) => (
                <tr key={r.portal} className="border-b border-line">
                  <td className="py-2 font-medium">{r.portal}</td>
                  <td className="py-2">{r.mrr}</td>
                  <td className="py-2">{r.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" /> API keys
            </CardTitle>
            <p className="mt-2 text-sm text-muted">
              OpenAI, CrossRef, Semantic Scholar, Stripe
            </p>
            <Button className="mt-4" variant="secondary" size="sm">
              Manage secrets
            </Button>
          </Card>
          <Card>
            <CardTitle>Portal configuration</CardTitle>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.values(PORTALS).map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <Link href={`/${p.id}`} className="text-brand-600 underline">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>App releases</CardTitle>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              <li>Android v1.2.0 — published</li>
              <li>iOS v1.2.0 — TestFlight</li>
              <li>macOS v1.1.0 — notarized</li>
              <li>Windows v1.1.0 — signed</li>
            </ul>
            <Link href="/download">
              <Button className="mt-4" variant="outline" size="sm">
                Download page
              </Button>
            </Link>
          </Card>
          <Card>
            <CardTitle>Subscription overrides</CardTitle>
            <p className="mt-2 text-sm text-muted">
              Edit monthly prices per portal tier in{" "}
              <code className="rounded bg-line px-1">src/lib/portals.ts</code>
            </p>
          </Card>
        </div>
      </ModuleWorkspace>
    </>
  );
}
