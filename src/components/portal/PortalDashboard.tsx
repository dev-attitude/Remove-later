import Link from "next/link";
import {
  getModulesForPortal,
  getPortal,
  portalPath,
  formatPrice,
  type PortalId,
} from "@/lib/portals";
import { Card, CardTitle } from "@/components/ui/Card";
import { Download, CreditCard, ArrowRight } from "lucide-react";

const PORTAL_WIDGETS: Record<PortalId, { label: string; value: string }[]> = {
  institution: [
    { label: "Students supervised", value: "24" },
    { label: "Pending reviews", value: "8" },
    { label: "To mark", value: "5" },
    { label: "Approvals waiting", value: "3" },
  ],
  student: [
    { label: "Research progress", value: "68%" },
    { label: "Word count", value: "12,450" },
    { label: "Citations", value: "47" },
    { label: "Supervisor feedback", value: "2 new" },
  ],
  analysis: [
    { label: "Active datasets", value: "6" },
    { label: "Tests run", value: "34" },
    { label: "Transcription hrs", value: "4.2" },
    { label: "Reports exported", value: "12" },
  ],
  developer: [
    { label: "MRR", value: "$52.4k" },
    { label: "Active users", value: "2,538" },
    { label: "Institutions", value: "38" },
    { label: "API errors (24h)", value: "0.02%" },
  ],
};

export function PortalDashboard({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId)!;
  const modules = getModulesForPortal(portalId);
  const widgets = PORTAL_WIDGETS[portalId];
  const Icon = portal.icon;
  const featured = portal.subscriptions.find((s) => s.highlighted) ?? portal.subscriptions[0];

  return (
    <div>
      <section className={`${portal.gradient} px-8 py-10 text-white`}>
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white/80">
          <Icon className="h-4 w-4" />
          {portal.name}
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold md:text-4xl">
          {portal.tagline}
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">{portal.description}</p>
        <p className="mt-2 text-sm text-white/70">
          Roles: {portal.roles.join(" · ")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {modules[0] && (
            <Link
              href={modules[0].href}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              Open {modules[0].title} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={portalPath(portalId, "subscription")}
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            <CreditCard className="h-4 w-4" /> Plans from {formatPrice(featured)}
          </Link>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Get the app
          </Link>
        </div>
      </section>

      <div className="p-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {widgets.map((w) => (
            <Card key={w.label} className="!p-4">
              <p className="text-xs text-slate-500">{w.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{w.value}</p>
            </Card>
          ))}
        </div>

        <h2 className="mb-4 font-display text-xl font-bold text-slate-900">
          Your tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const ModIcon = m.icon;
            return (
              <Link key={m.id} href={m.href}>
                <Card className="h-full transition hover:border-brand-200 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-brand-600">
                      <ModIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="!text-base">{m.title}</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">{m.short}</p>
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
