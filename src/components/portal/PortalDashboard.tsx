import Link from "next/link";
import {
  getModulesForPortal,
  getPortal,
  portalPath,
  type PortalId,
} from "@/lib/portals";
import { PortalTierPrice } from "@/components/portal/PortalTierPrice";
import { Card, CardTitle } from "@/components/ui/Card";
import { Download, CreditCard, ArrowRight } from "lucide-react";
import { PortalDashboardWidgets } from "./PortalDashboardWidgets";

export function PortalDashboard({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId)!;
  const modules = getModulesForPortal(portalId);
  const Icon = portal.icon;
  const featured = portal.subscriptions.find((s) => s.highlighted) ?? portal.subscriptions[0];

  return (
    <div>
      <section className={`${portal.gradient} px-8 py-10 text-offwhite`}>
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-offwhite/80">
          <Icon className="h-4 w-4" />
          {portal.name}
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold md:text-4xl">
          {portal.tagline}
        </h1>
        <p className="mt-3 max-w-2xl text-offwhite/90">{portal.description}</p>
        <p className="mt-2 text-sm text-offwhite/70">
          Roles: {portal.roles.join(" · ")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {modules[0] && (
            <Link
              href={modules[0].href}
              className="inline-flex items-center gap-2 rounded-lg bg-offwhite px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              Open {modules[0].title} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={portalPath(portalId, "subscription")}
            className="inline-flex items-center gap-2 rounded-lg border border-offwhite/40 px-4 py-2 text-sm font-medium hover:bg-offwhite/10"
          >
            <CreditCard className="h-4 w-4" /> Plans from{" "}
            <PortalTierPrice tier={featured} />
          </Link>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 rounded-lg border border-offwhite/40 px-4 py-2 text-sm font-medium hover:bg-offwhite/10"
          >
            <Download className="h-4 w-4" /> Get the app
          </Link>
        </div>
      </section>

      <div className="p-4 sm:p-6 lg:p-8">
        <PortalDashboardWidgets portalId={portalId} />

        <h2 className="mb-4 font-display text-xl font-bold text-charcoal">
          Your tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const ModIcon = m.icon;
            return (
              <Link key={m.id} href={m.href}>
                <Card className="h-full transition hover:border-brand-200 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-line p-2 text-brand-600">
                      <ModIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="!text-base">{m.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted">{m.short}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
