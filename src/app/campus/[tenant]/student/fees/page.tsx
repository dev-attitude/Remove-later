import Link from "next/link";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { formatCampusCurrency } from "@/lib/campus/data";
import { FEE_STATEMENT, getStudentRecord } from "@/lib/campus/student";
import { SPONSORSHIP } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function FeesPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const student = await getStudentRecord(slug);

  const totalDebits = FEE_STATEMENT.reduce((s, e) => s + (e.debit ?? 0), 0);
  const totalCredits = FEE_STATEMENT.reduce((s, e) => s + (e.credit ?? 0), 0);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Fees & Wallet"
        description={`Account statement for ${student.studentNumber} at ${tenant.name}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Charged this year</p>
          <p className="text-2xl font-bold text-slate-900">{formatCampusCurrency(totalDebits)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Paid this year</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCampusCurrency(totalCredits)}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Balance due</p>
          <p className="text-2xl font-bold text-amber-900">
            {formatCampusCurrency(student.feesOutstanding)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Charge</th>
              <th className="px-4 py-3 text-right">Payment</th>
            </tr>
          </thead>
          <tbody>
            {FEE_STATEMENT.map((e, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-600">{e.date}</td>
                <td className="px-4 py-3 text-slate-900">{e.description}</td>
                <td className="px-4 py-3 text-right text-rose-700">
                  {e.debit ? formatCampusCurrency(e.debit) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-emerald-700">
                  {e.credit ? formatCampusCurrency(e.credit) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Pay now (demo)
        </button>
        <Link
          href={`/campus/${slug}/wallet`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open digital wallet
        </Link>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Production: bank cards, mobile money, EFT, and QR payments settle directly to the institution.
      </p>

      <h2 className="mb-3 mt-10 text-lg font-semibold text-slate-900">Sponsorship & funding</h2>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-emerald-900">{SPONSORSHIP.funder}</p>
            <p className="text-sm text-emerald-800">{SPONSORSHIP.status}</p>
          </div>
          <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">
            Funded
          </span>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-emerald-900">
          {SPONSORSHIP.covered.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
        <div className="mt-4 overflow-x-auto rounded-lg bg-white/70">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Disbursement</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {SPONSORSHIP.payments.map((p) => (
                <tr key={p.description} className="border-t border-emerald-100">
                  <td className="px-3 py-2 text-slate-600">{p.date}</td>
                  <td className="px-3 py-2 text-slate-900">{p.description}</td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-800">
                    {formatCampusCurrency(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
