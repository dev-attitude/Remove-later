import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { STUDENT_TIMETABLE } from "@/lib/campus/student";

type Props = { params: Promise<{ tenant: string }> };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default async function TimetablePage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="My Timetable"
        description={`Weekly schedule — Semester 2, 2026 at ${tenant.name}.`}
      />

      <div className="space-y-6">
        {DAYS.map((day) => {
          const entries = STUDENT_TIMETABLE.filter((e) => e.day === day);
          return (
            <section key={day}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {day}
              </h2>
              {entries.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
                  No scheduled classes
                </p>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div
                      key={`${e.day}-${e.time}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{e.module}</p>
                        <p className="text-xs text-slate-500">
                          {e.venue} · {e.lecturer}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {e.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
