import { AlertTriangle, CalendarDays, CheckCircle2, FileCheck } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import {
  EXAM_SCHEDULE,
  INTEGRITY_FLAGS,
  MODERATION_QUEUE,
  RESULT_PUBLICATION,
} from "@/lib/campus/management-data";

type Props = { params: Promise<{ tenant: string }> };

const MOD_STATUS: Record<string, string> = {
  "awaiting moderation": "bg-amber-100 text-amber-800",
  moderated: "bg-emerald-100 text-emerald-800",
  "changes requested": "bg-rose-100 text-rose-800",
};

export default async function ExamOfficePage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Examinations"
        title="Examination Office"
        description={`Scheduling, moderation, mark verification, and result publication for ${tenant.name}.`}
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <CalendarDays className="h-5 w-5" /> Exam scheduling
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Candidates</th>
                <th className="px-4 py-3">Invigilators</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {EXAM_SCHEDULE.map((e) => (
                <tr key={e.module} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{e.module}</td>
                  <td className="px-4 py-3 text-slate-600">{e.date}</td>
                  <td className="px-4 py-3 text-slate-600">{e.venue}</td>
                  <td className="px-4 py-3 text-slate-600">{e.candidates}</td>
                  <td className="px-4 py-3 text-slate-600">{e.invigilators}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                      {e.status}
                    </span>
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
          Generate seating plans (demo)
        </button>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FileCheck className="h-5 w-5" /> Moderation queue
          </h2>
          <div className="space-y-2">
            {MODERATION_QUEUE.map((m) => (
              <div key={m.module} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{m.module}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${MOD_STATUS[m.status]}`}>
                    {m.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Examiner: {m.examiner} · Moderator: {m.moderator}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CheckCircle2 className="h-5 w-5" /> Result publication
          </h2>
          <div className="space-y-2">
            {RESULT_PUBLICATION.map((r) => (
              <div key={r.term} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{r.term}</p>
                    <p className="text-xs text-slate-500">
                      {r.verified}/{r.modules} modules verified
                      {r.published && ` · Published ${r.date}`}
                    </p>
                  </div>
                  {r.published ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Published
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={r.verified < r.modules}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {r.verified < r.modules ? "Verification incomplete" : "Publish (demo)"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <AlertTriangle className="h-5 w-5 text-rose-600" /> AI integrity flags
          </h2>
          <div className="space-y-2">
            {INTEGRITY_FLAGS.map((f) => (
              <div
                key={f.exam}
                className={`rounded-xl border p-4 text-sm ${
                  f.severity === "high"
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <p className="font-semibold">{f.exam}</p>
                <p className="mt-0.5">{f.flag}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
