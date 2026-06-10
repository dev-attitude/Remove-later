import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getRiskStudents } from "@/lib/campus/data";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { RiskTable } from "@/components/campus/RiskTable";

type Props = { params: Promise<{ tenant: string }> };

export default async function StudentSuccessPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const students = await getRiskStudents(slug);

  return (
    <div>
      <CampusPageHeader
        badge="AI"
        title="Student Success Centre"
        description={`Predictive analytics for ${tenant.name} — identify at-risk students before failure, dropout, or fee default.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "High failure risk", count: students.filter((s) => s.failureRisk >= 80).length },
          { label: "Dropout risk", count: students.filter((s) => s.dropoutRisk >= 70).length },
          { label: "Fee default risk", count: students.filter((s) => s.feeDefaultRisk >= 70).length },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs font-medium uppercase text-rose-700">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-rose-900">{card.count}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Risk students</h2>
      <RiskTable students={students} />

      <p className="mt-4 text-xs text-slate-500">
        Models combine attendance, marks, fee history, and engagement signals. Production deployments
        can use OpenAI or on-premise models with institution-specific training data.
      </p>
    </div>
  );
}
