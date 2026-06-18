import type { RiskStudent } from "@/lib/campus/types";

function riskClass(pct: number): string {
  if (pct >= 80) return "bg-rose-100 text-rose-800";
  if (pct >= 60) return "bg-amber-100 text-amber-800";
  return "bg-line text-charcoal";
}

export function RiskTable({ students }: { students: RiskStudent[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-offwhite">
      <table className="min-w-full text-sm">
        <thead className="border-b border-line bg-cream-50 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Programme</th>
            <th className="px-4 py-3">Failure risk</th>
            <th className="px-4 py-3">Dropout risk</th>
            <th className="px-4 py-3">Fee default</th>
            <th className="px-4 py-3">Graduation likelihood</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.studentNumber} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium text-charcoal">{s.name}</p>
                <p className="text-xs text-muted">{s.studentNumber}</p>
              </td>
              <td className="px-4 py-3 text-muted">{s.programme}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskClass(s.failureRisk)}`}>
                  {s.failureRisk}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskClass(s.dropoutRisk)}`}>
                  {s.dropoutRisk}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskClass(s.feeDefaultRisk)}`}>
                  {s.feeDefaultRisk}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                  {s.graduationLikelihood}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
