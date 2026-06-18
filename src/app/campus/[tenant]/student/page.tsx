import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  GraduationCap,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { formatCampusCurrency } from "@/lib/campus/data";
import { getStudentRecord, STUDENT_TIMETABLE } from "@/lib/campus/student";
import {
  ACADEMIC_PROGRESS,
  ASSESSMENTS,
  MODULE_ATTENDANCE,
  NOTIFICATIONS,
} from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function StudentDashboardPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const student = await getStudentRecord(slug);

  const gradPct = Math.round(
    (ACADEMIC_PROGRESS.creditsCompleted / ACADEMIC_PROGRESS.creditsTotal) * 100
  );
  const openDeadlines = ASSESSMENTS.filter((a) => a.status === "open");
  const lowAttendance = MODULE_ATTENDANCE.filter(
    (m) => Math.round((m.attended / m.total) * 100) < 80
  );
  const todayClasses = STUDENT_TIMETABLE.slice(0, 2);

  return (
    <div>
      <CampusPageHeader
        badge="Student Success Dashboard"
        title={`Welcome back, ${student.name.split(" ")[0]}`}
        description={`${student.studentNumber} · ${student.programme} · ${tenant.name}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <CampusMetricCard
          label="Current GPA"
          value={ACADEMIC_PROGRESS.cgpa.toFixed(2)}
          sub="Cumulative (4.0 scale)"
          icon={GraduationCap}
          tone="success"
        />
        <CampusMetricCard
          label="Attendance"
          value={`${student.attendancePct}%`}
          sub="This semester"
          icon={Percent}
          tone={student.attendancePct >= 80 ? "success" : "warning"}
        />
        <CampusMetricCard
          label="Graduation progress"
          value={`${gradPct}%`}
          sub={`${ACADEMIC_PROGRESS.creditsCompleted}/${ACADEMIC_PROGRESS.creditsTotal} credits`}
          icon={TrendingUp}
        />
        <CampusMetricCard
          label="Outstanding fees"
          value={formatCampusCurrency(student.feesOutstanding)}
          sub="See Fees & Wallet"
          icon={Wallet}
          tone={student.feesOutstanding > 0 ? "warning" : "success"}
        />
        <CampusMetricCard
          label="Upcoming deadlines"
          value={String(openDeadlines.length)}
          sub="Assessments due"
          icon={Bell}
          tone={openDeadlines.length > 0 ? "warning" : "success"}
        />
      </div>

      {(lowAttendance.length > 0 || student.feesOutstanding > 0) && (
        <div className="mt-6 space-y-2">
          {lowAttendance.map((m) => (
            <div
              key={m.code}
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>Academic risk alert:</strong> {m.code} attendance is{" "}
                {Math.round((m.attended / m.total) * 100)}% — below the 80% exam threshold.{" "}
                <Link href={`/campus/${slug}/student/attendance`} className="font-semibold underline">
                  View attendance
                </Link>
              </p>
            </div>
          ))}
          {student.feesOutstanding > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Outstanding balance of{" "}
                <strong>{formatCampusCurrency(student.feesOutstanding)}</strong>.{" "}
                <Link href={`/campus/${slug}/student/fees`} className="font-semibold underline">
                  View statement and pay
                </Link>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Deadlines</h2>
            <Link
              href={`/campus/${slug}/student/assessments`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              All assessments
            </Link>
          </div>
          <div className="space-y-2">
            {openDeadlines.map((a) => (
              <div key={a.id} className="rounded-xl border border-line bg-offwhite p-3">
                <p className="text-sm font-medium text-charcoal">{a.title}</p>
                <p className="text-xs text-muted">
                  {a.module} · Due {a.due}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Upcoming classes</h2>
            <Link
              href={`/campus/${slug}/student/timetable`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Timetable
            </Link>
          </div>
          <div className="space-y-2">
            {todayClasses.map((c) => (
              <div key={`${c.day}-${c.time}`} className="flex items-start gap-3 rounded-xl border border-line bg-offwhite p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-sm font-medium text-charcoal">{c.module}</p>
                  <p className="text-xs text-muted">
                    {c.day} · {c.time} · {c.venue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Notifications</h2>
            <Link
              href={`/campus/${slug}/student/announcements`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              All
            </Link>
          </div>
          <div className="space-y-2">
            {NOTIFICATIONS.slice(0, 4).map((n) => (
              <div key={n.text} className="rounded-xl border border-line bg-offwhite p-3">
                <p className="text-sm text-charcoal">{n.text}</p>
                <p className="text-[11px] text-muted">{n.at}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold text-charcoal">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Register modules", href: `/campus/${slug}/student/registration` },
          { label: "My results", href: `/campus/${slug}/student/results` },
          { label: "Pay fees", href: `/campus/${slug}/student/fees` },
          { label: "Documents", href: `/campus/${slug}/student/documents` },
          { label: "AI Assistant", href: `/campus/${slug}/advisor` },
          { label: "My digital ID", href: `/campus/${slug}/digital-id` },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-xl border border-line bg-offwhite p-4 text-center text-sm font-medium text-charcoal transition hover:border-blue-300 hover:text-blue-700"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
