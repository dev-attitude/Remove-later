import Link from "next/link";
import { ClipboardList, FileText, GraduationCap } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { CampusMetricCard } from "@/components/campus/CampusMetricCard";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { prisma } from "@/lib/db";
import {
  ADMISSIONS_PIPELINE,
  GRADUATION_QUEUE,
  REGISTRATION_STATS,
} from "@/lib/campus/management-data";

type Props = { params: Promise<{ tenant: string }> };

const APP_STATUS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const GRAD_STATUS: Record<string, string> = {
  cleared: "bg-emerald-100 text-emerald-800",
  "fees hold": "bg-amber-100 text-amber-800",
  "credits short": "bg-rose-100 text-rose-800",
};

export default async function RegistrarPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  const dbTenant = await prisma.campusTenant.findUnique({ where: { slug } });
  const programmes = dbTenant
    ? await prisma.campusProgramme.findMany({ where: { tenantId: dbTenant.id }, orderBy: { code: "asc" } })
    : [];

  return (
    <div>
      <CampusPageHeader
        badge="Registrar"
        title="Registrar Portal"
        description={`Admissions, registration, programmes, graduation, and transcripts for ${tenant.name}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <CampusMetricCard
          label="Registered students"
          value={REGISTRATION_STATS.registered.toLocaleString()}
          sub={`Deadline ${REGISTRATION_STATS.deadline}`}
          icon={ClipboardList}
          tone="success"
        />
        <CampusMetricCard
          label="Pending clearance"
          value={String(REGISTRATION_STATS.pendingClearance)}
          sub="Awaiting finance / documents"
          icon={FileText}
          tone="warning"
        />
        <CampusMetricCard
          label="Unregistered"
          value={String(REGISTRATION_STATS.unregistered)}
          sub="Returning students"
          icon={GraduationCap}
          tone="danger"
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Admissions pipeline</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ADMISSIONS_PIPELINE.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{a.applicant}</td>
                  <td className="px-4 py-3 text-slate-600">{a.programme}</td>
                  <td className="px-4 py-3 text-slate-600">{a.submitted}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${APP_STATUS[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(a.status === "pending" || a.status === "review") && (
                      <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                        Review (demo)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Programmes</h2>
          <div className="space-y-2">
            {programmes.map((p) => (
              <div
                key={p.code}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {p.code} — {p.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.faculty} · NQF {p.nqfLevel} · Pass rate {p.passRate}%
                  </p>
                </div>
                <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                  Manage (demo)
                </button>
              </div>
            ))}
            {programmes.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                No programmes found for this tenant.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Graduation processing</h2>
          <div className="space-y-2">
            {GRADUATION_QUEUE.map((g) => (
              <div key={g.student} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{g.student}</p>
                    <p className="text-xs text-slate-500">
                      {g.programme} · {g.credits} credits
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${GRAD_STATUS[g.status]}`}>
                    {g.status}
                  </span>
                </div>
                {g.status === "cleared" && (
                  <button
                    type="button"
                    className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Generate transcript & certificate (demo)
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Generated transcripts get a QR verification code — verifiable on the{" "}
            <Link href={`/campus/${slug}/verify`} className="font-medium text-blue-600 hover:underline">
              public verification hub
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
