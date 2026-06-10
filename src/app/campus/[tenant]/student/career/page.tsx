import { Briefcase, FileText, Users } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { ALUMNI_MENTORS, CAREER_OPPORTUNITIES } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

const TYPE_STYLES: Record<string, string> = {
  internship: "bg-blue-100 text-blue-800",
  graduate: "bg-emerald-100 text-emerald-800",
  "part-time": "bg-amber-100 text-amber-800",
  placement: "bg-violet-100 text-violet-800",
};

export default async function CareerPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Career Portal"
        description={`Internships, graduate jobs, placements, CV tools, and alumni mentorship for ${tenant.name} students.`}
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Briefcase className="h-5 w-5" /> Opportunities
        </h2>
        <div className="space-y-3">
          {CAREER_OPPORTUNITIES.map((o) => (
            <div
              key={o.title}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_STYLES[o.type]}`}>
                    {o.type}
                  </span>
                  <p className="font-medium text-slate-900">{o.title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {o.organisation} · {o.location} · Closes {o.closing}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
              >
                Apply (demo)
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-blue-900">
            <FileText className="h-5 w-5" /> CV Builder
          </h2>
          <p className="mt-1 text-sm text-blue-800">
            Generate a professional CV, resume, or cover letter from your academic record,
            certificates, and experience — AI-assisted.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Generate CV", "Generate resume", "Cover letter"].map((b) => (
              <button
                key={b}
                type="button"
                className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white"
              >
                {b} (demo)
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Users className="h-5 w-5" /> Alumni mentors
          </h2>
          <div className="mt-3 space-y-3">
            {ALUMNI_MENTORS.map((m) => (
              <div key={m.name} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.role} · {m.focus}
                </p>
                <button type="button" className="mt-1 text-xs font-medium text-blue-600 hover:underline">
                  Request mentorship (demo)
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
