import { AlertTriangle } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { MODULE_ATTENDANCE } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function AttendancePage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  const overall = Math.round(
    (MODULE_ATTENDANCE.reduce((s, m) => s + m.attended, 0) /
      MODULE_ATTENDANCE.reduce((s, m) => s + m.total, 0)) *
      100
  );

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Attendance Records"
        description={`Class attendance per module at ${tenant.name}. Most institutions require 80% to write exams.`}
      />

      <div className="mb-6 rounded-xl border border-line bg-offwhite p-5">
        <p className="text-xs text-muted">Overall attendance</p>
        <p className={`text-4xl font-bold ${overall >= 80 ? "text-emerald-700" : "text-rose-700"}`}>
          {overall}%
        </p>
      </div>

      <div className="space-y-4">
        {MODULE_ATTENDANCE.map((m) => {
          const pct = Math.round((m.attended / m.total) * 100);
          const warning = pct < 80;
          return (
            <div key={m.code} className="rounded-xl border border-line bg-offwhite p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-charcoal">
                    {m.code} — {m.title}
                  </p>
                  <p className="text-xs text-muted">
                    Attended {m.attended} of {m.total} sessions
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    warning ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {pct}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full ${warning ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {warning && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Below the 80% exam admission threshold. Missed:{" "}
                    {m.missedDates.join(", ")}. Contact your lecturer if any absence should be
                    excused.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
