import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { ACADEMIC_PROGRESS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function ProgressPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const p = ACADEMIC_PROGRESS;
  const pct = Math.round((p.creditsCompleted / p.creditsTotal) * 100);
  const remaining = p.creditsTotal - p.creditsCompleted;
  const maxGpa = 4;

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Academic Progress"
        description={`Your journey to graduation at ${tenant.name}.`}
      />

      <div className="rounded-xl border border-line bg-offwhite p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-semibold text-charcoal">Degree progress</h2>
          <span className="text-3xl font-bold text-blue-700">{pct}%</span>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Completed</p>
            <p className="text-xl font-bold text-charcoal">{p.creditsCompleted} credits</p>
          </div>
          <div>
            <p className="text-xs text-muted">Remaining</p>
            <p className="text-xl font-bold text-charcoal">{remaining} credits</p>
          </div>
          <div>
            <p className="text-xs text-muted">Expected graduation</p>
            <p className="text-xl font-bold text-charcoal">{p.expectedGraduation}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-offwhite p-6">
          <h2 className="text-lg font-semibold text-charcoal">CGPA</h2>
          <p className="mt-2 text-4xl font-bold text-emerald-700">{p.cgpa.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted">Cumulative grade point average (4.0 scale)</p>
        </div>

        <div className="rounded-xl border border-line bg-offwhite p-6">
          <h2 className="mb-4 text-lg font-semibold text-charcoal">GPA per semester</h2>
          <div className="flex items-end gap-3" style={{ height: 120 }}>
            {p.gpaHistory.map((g) => (
              <div key={g.term} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-charcoal">{g.gpa.toFixed(1)}</span>
                <div
                  className="w-full rounded-t bg-blue-500"
                  style={{ height: `${(g.gpa / maxGpa) * 90}px` }}
                />
                <span className="text-[10px] text-muted">{g.term}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>AI insight:</strong> Your GPA trend is improving. Passing all current modules keeps
        you on track to graduate by {p.expectedGraduation}.
      </div>
    </div>
  );
}
