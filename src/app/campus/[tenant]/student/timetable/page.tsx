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
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {day}
              </h2>
              {entries.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line bg-offwhite p-4 text-sm text-muted">
                  No scheduled classes
                </p>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div
                      key={`${e.day}-${e.time}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-offwhite p-4"
                    >
                      <div>
                        <p className="font-medium text-charcoal">{e.module}</p>
                        <p className="text-xs text-muted">
                          {e.venue} · {e.lecturer}
                        </p>
                      </div>
                      <span className="rounded-full bg-line px-3 py-1 text-sm font-medium text-charcoal">
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
