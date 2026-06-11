import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CAMPUS_NAV } from "@/lib/campus/nav";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { getTenantMetrics, formatCampusCurrency } from "@/lib/campus/data";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { Users, TrendingUp, Wallet, Award } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ tenant: string }> };

/** Department staff and students land on their own portal, not the management overview */
const ROLE_HOME: Record<string, string> = {
  student: "student",
  lecturer: "lecturer",
  registrar: "registrar",
  exams: "exam-office",
  finance: "finance",
};

async function getMemberRole(slug: string): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await prisma.campusTenant.findUnique({ where: { slug } });
  if (!tenant) return null;
  const membership = await prisma.campusMembership.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId: session.user.id } },
  });
  return membership?.role ?? null;
}

export default async function CampusOverviewPage({ params }: Props) {
  const { tenant: slug } = await params;
  const role = await getMemberRole(slug);
  const home = role ? ROLE_HOME[role] : undefined;
  if (home) redirect(`/campus/${slug}/${home}`);

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
