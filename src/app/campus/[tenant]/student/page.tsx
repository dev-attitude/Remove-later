import Link from "next/link";
import { CalendarDays, GraduationCap, Percent, Wallet } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { formatCampusCurrency } from "@/lib/campus/data";
import { getStudentRecord, STUDENT_TIMETABLE } from "@/lib/campus/student";

type Props = { params: Promise<{ tenant: string }> };

export default async function StudentDashboardPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const student = await getStudentRecord(slug);
  const todayClasses = STUDENT_TIMETABLE.slice(0, 2);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title={`Welcome back, ${student.name.split(" ")[0]}`}
        description={`${student.studentNumber} · ${student.programme} · ${tenant.name}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampusMetricCard
          label="Average mark"
          value={`${student.averageMark}%`}
          sub="Across registered modules"
          icon={GraduationCap}
          tone={student.averageMark >= 60 ? "success" : "warning"}
        />
        <CampusMetricCard
          label="Attendance"
          value={`${student.attendancePct}%`}
          sub="This semester"
          icon={Percent}
          tone={student.attendancePct >= 80 ? "success" : "warning"}
        />
        <CampusMetricCard
          label="Fees outstanding"
          value={formatCampusCurrency(student.feesOutstanding)}
          sub="See Fees & Wallet"
          icon={Wallet}
          tone={student.feesOutstanding > 0 ? "warning" : "success"}
        />
        <CampusMetricCard
          label="Graduation likelihood"
          value={`${student.graduationLikelihood}%`}
          sub="AI prediction"
          icon={GraduationCap}
        />
      </div>

      {student.feesOutstanding > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You have an outstanding balance of{" "}
          <strong>{formatCampusCurrency(student.feesOutstanding)}</strong>.{" "}
          <Link href={`/campus/${slug}/student/fees`} className="font-semibold underline">
            View statement and pay
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming classes</h2>
            <Link
              href={`/campus/${slug}/student/timetable`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Full timetable
            </Link>
          </div>
          <div className="space-y-3">
            {todayClasses.map((c) => (
              <div
                key={`${c.day}-${c.time}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="rounded-lg bg-slate-100 p-2">
                  <CalendarDays className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{c.module}</p>
                  <p className="text-sm text-slate-600">
                    {c.day} · {c.time} · {c.venue}
                  </p>
                  <p className="text-xs text-slate-500">{c.lecturer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Register modules", href: `/campus/${slug}/student/registration` },
              { label: "View results", href: `/campus/${slug}/student/results` },
              { label: "Pay fees", href: `/campus/${slug}/student/fees` },
              { label: "Ask AI Advisor", href: `/campus/${slug}/advisor` },
              { label: "Open LMS", href: `/campus/${slug}/lms` },
              { label: "My digital ID", href: `/campus/${slug}/digital-id` },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                {a.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
