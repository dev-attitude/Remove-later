import Link from "next/link";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CAMPUS_NAV } from "@/lib/campus/nav";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { getTenantMetrics, formatCampusCurrency } from "@/lib/campus/data";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { Users, TrendingUp, Wallet, Award } from "lucide-react";

type Props = { params: Promise<{ tenant: string }> };

export default async function CampusOverviewPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const metrics = await getTenantMetrics(slug);

  const modules = CAMPUS_NAV.filter((m) => m.id !== "overview");

  return (
    <div>
      <CampusPageHeader
        title={`${tenant.name} Portal`}
        description="White-label institutional workspace — switch modules from the sidebar or explore highlights below."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampusMetricCard
          label="Enrollment"
          value={metrics.enrollment.toLocaleString()}
          sub={`${metrics.retentionPct}% retention`}
          icon={Users}
        />
        <CampusMetricCard
          label="Collection rate"
          value={`${metrics.collectionRatePct}%`}
          sub={formatCampusCurrency(metrics.outstandingFees, metrics.currency) + " outstanding"}
          icon={Wallet}
          tone="warning"
        />
        <CampusMetricCard
          label="Pass rate"
          value={`${metrics.passRatePct}%`}
          sub={`${metrics.graduationRatePct}% graduation rate`}
          icon={Award}
        />
        <CampusMetricCard
          label="Tuition revenue"
          value={formatCampusCurrency(metrics.tuitionRevenue, metrics.currency)}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Modules</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              href={m.href(slug)}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="rounded-lg bg-slate-100 p-2">
                <Icon className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{m.label}</p>
                {m.badge && (
                  <span className="text-xs font-semibold text-blue-600">{m.badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
