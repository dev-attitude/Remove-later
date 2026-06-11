import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getTenantMetrics, formatCampusCurrency } from "@/lib/campus/data";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { Wallet, Receipt, PiggyBank, Truck } from "lucide-react";
import {
  FEE_STRUCTURES,
  RECENT_PAYMENTS,
  TOP_DEBTORS,
} from "@/lib/campus/management-data";

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

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Fee structures (2026)</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3 text-right">Tuition / year</th>
                <th className="px-4 py-3 text-right">Registration</th>
                <th className="px-4 py-3 text-right">Exam fee</th>
              </tr>
            </thead>
            <tbody>
              {FEE_STRUCTURES.map((f) => (
                <tr key={f.programme} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{f.programme}</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatCampusCurrency(f.tuition)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatCampusCurrency(f.registration)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatCampusCurrency(f.examFee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit fee structures (demo)
        </button>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Debtors management</h2>
          <div className="space-y-2">
            {TOP_DEBTORS.map((d) => (
              <div key={d.student} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{d.student}</p>
                    <p className="text-xs text-slate-500">Last payment {d.lastPayment}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-700">{formatCampusCurrency(d.balance)}</p>
                    <p className="text-xs text-slate-500">AI default risk {d.risk}%</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                    Send reminder (demo)
                  </button>
                  <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                    Payment plan (demo)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Payment reconciliation</h2>
          <div className="space-y-2">
            {RECENT_PAYMENTS.map((p) => (
              <div
                key={p.ref}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{p.student}</p>
                  <p className="text-xs text-slate-500">
                    {p.ref} · {p.method} · {p.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-700">{formatCampusCurrency(p.amount)}</p>
                  <span
                    className={`text-xs font-medium ${
                      p.reconciled ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {p.reconciled ? "Reconciled" : "Pending reconciliation"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
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
