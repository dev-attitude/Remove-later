import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getTenantMetrics, formatCampusCurrency } from "@/lib/campus/data";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { Wallet, Receipt, PiggyBank, Truck } from "lucide-react";

type Props = { params: Promise<{ tenant: string }> };

const MODULES = [
  "Procurement",
  "Assets",
  "Budgeting",
  "Payroll",
  "Accounts Receivable",
  "Accounts Payable",
];

export default async function FinancePage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const m = await getTenantMetrics(slug);

  return (
    <div>
      <CampusPageHeader
        title="Smart Finance ERP"
        description={`Revenue, debtors, and full finance modules for ${tenant.name}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampusMetricCard
          label="Tuition revenue"
          value={formatCampusCurrency(m.tuitionRevenue, m.currency)}
          icon={Wallet}
          tone="success"
        />
        <CampusMetricCard
          label="Outstanding fees"
          value={formatCampusCurrency(m.outstandingFees, m.currency)}
          icon={Receipt}
          tone="danger"
        />
        <CampusMetricCard
          label="Collection rate"
          value={`${m.collectionRatePct}%`}
          icon={PiggyBank}
        />
        <CampusMetricCard
          label="Procurement (YTD)"
          value={formatCampusCurrency(Math.round(m.tuitionRevenue * 0.12), m.currency)}
          sub="Demo figure"
          icon={Truck}
        />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Finance modules</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <div key={mod} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">{mod}</p>
            <p className="mt-1 text-xs text-slate-500">Integrated with student wallet & payroll</p>
          </div>
        ))}
      </div>
    </div>
  );
}
