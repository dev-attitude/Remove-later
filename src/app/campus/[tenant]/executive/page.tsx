import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getTenantMetrics, formatCampusCurrency } from "@/lib/campus/data";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingDown,
  BarChart3,
  Briefcase,
} from "lucide-react";

type Props = { params: Promise<{ tenant: string }> };

export default async function ExecutivePage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const m = await getTenantMetrics(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Vice Chancellor"
        title="Executive Command Centre"
        description={`Real-time institutional intelligence for ${tenant.name} — enrollment, finance, academic performance, and HR at a glance.`}
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Students
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <CampusMetricCard
            label="Total enrollment"
            value={m.enrollment.toLocaleString()}
            icon={Users}
          />
          <CampusMetricCard
            label="Retention"
            value={`${m.retentionPct}%`}
            icon={BarChart3}
            tone="success"
          />
          <CampusMetricCard
            label="Graduation rate"
            value={`${m.graduationRatePct}%`}
            icon={GraduationCap}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Finance
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <CampusMetricCard
            label="Tuition revenue"
            value={formatCampusCurrency(m.tuitionRevenue, m.currency)}
            icon={Wallet}
            tone="success"
          />
          <CampusMetricCard
            label="Outstanding fees"
            value={formatCampusCurrency(m.outstandingFees, m.currency)}
            icon={TrendingDown}
            tone="danger"
          />
          <CampusMetricCard
            label="Collection rate"
            value={`${m.collectionRatePct}%`}
            icon={BarChart3}
            tone={m.collectionRatePct >= 85 ? "success" : "warning"}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Academic & HR
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <CampusMetricCard
            label="Institutional pass rate"
            value={`${m.passRatePct}%`}
            sub="Across all faculties and programmes"
            icon={GraduationCap}
          />
          <CampusMetricCard
            label="Staff headcount"
            value={m.staffCount.toLocaleString()}
            sub="Academic and administrative"
            icon={Briefcase}
          />
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>AI insight:</strong> Fee collection is {m.collectionRatePct >= 86 ? "on target" : "below target"}.
        {m.collectionRatePct < 86 &&
          " Student Success AI flagged 12 accounts with high fee-default risk — review the Success Centre."}
      </div>
    </div>
  );
}
