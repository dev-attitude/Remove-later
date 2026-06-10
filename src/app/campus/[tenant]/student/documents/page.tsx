import { Award, Download, QrCode } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CERTIFICATE_VAULT, STUDENT_DOCUMENTS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function DocumentsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Academic Documents"
        description={`Download official documents from ${tenant.name} — every PDF carries a QR verification code employers can scan.`}
      />

      <div className="space-y-3">
        {STUDENT_DOCUMENTS.map((d) => {
          const available = d.updated !== "—";
          return (
            <div
              key={d.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <QrCode className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.description}</p>
                  {available && <p className="text-xs text-slate-400">Updated {d.updated}</p>}
                </div>
              </div>
              <button
                type="button"
                disabled={!available}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                {available ? "Download PDF (demo)" : "Not yet available"}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold text-slate-900">Digital Certificate Vault</h2>
      <p className="mb-4 text-sm text-slate-600">
        Certificates, awards, and badges stored securely — shareable with employers via verified links.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CERTIFICATE_VAULT.map((c) => (
          <div key={c.name} className="rounded-xl border border-slate-200 bg-white p-4">
            <Award className="h-6 w-6 text-amber-500" />
            <p className="mt-2 font-medium text-slate-900">{c.name}</p>
            <p className="text-xs text-slate-500">
              {c.issuer} · {c.year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
