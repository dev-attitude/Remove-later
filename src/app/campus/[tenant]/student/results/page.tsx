import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getStudentRecord, STUDENT_RESULTS } from "@/lib/campus/student";

type Props = { params: Promise<{ tenant: string }> };

const STATUS_STYLES = {
  distinction: "bg-emerald-100 text-emerald-800",
  pass: "bg-blue-100 text-blue-800",
  fail: "bg-rose-100 text-rose-800",
} as const;

export default async function ResultsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const student = await getStudentRecord(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="My Results"
        description={`Official results for ${student.studentNumber} — ${student.programme}, ${tenant.name}.`}
      />

      <div className="space-y-8">
        {STUDENT_RESULTS.map((sem) => (
          <section key={sem.semester}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{sem.semester}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                GPA {sem.gpa.toFixed(1)}
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Mark</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.modules.map((m) => (
                    <tr key={m.code} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{m.code}</p>
                        <p className="text-xs text-slate-500">{m.title}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.credits}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{m.mark}%</td>
                      <td className="px-4 py-3 text-slate-700">{m.grade}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[m.status]}`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Official transcripts carry a QR verification code — see the Transcript Verify module.
      </p>
    </div>
  );
}
