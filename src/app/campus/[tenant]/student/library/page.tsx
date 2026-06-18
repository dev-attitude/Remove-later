import { BookMarked, ExternalLink } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { formatCampusCurrency } from "@/lib/campus/data";
import { LIBRARY_FINES, LIBRARY_LOANS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function LibraryPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Library Portal"
        description={`Borrowed books, due dates, fines, and digital library access at ${tenant.name}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-offwhite p-4">
          <p className="text-xs text-muted">Books on loan</p>
          <p className="text-2xl font-bold text-charcoal">{LIBRARY_LOANS.length}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs text-rose-700">Overdue</p>
          <p className="text-2xl font-bold text-rose-900">
            {LIBRARY_LOANS.filter((l) => l.overdue).length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Outstanding fines</p>
          <p className="text-2xl font-bold text-amber-900">{formatCampusCurrency(LIBRARY_FINES)}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-charcoal">My loans</h2>
      <div className="space-y-3">
        {LIBRARY_LOANS.map((l) => (
          <div
            key={l.title}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
              l.overdue ? "border-rose-200 bg-rose-50" : "border-line bg-offwhite"
            }`}
          >
            <div className="flex items-start gap-3">
              <BookMarked className="mt-0.5 h-5 w-5 text-muted" />
              <div>
                <p className="font-medium text-charcoal">{l.title}</p>
                <p className="text-xs text-muted">{l.author}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${l.overdue ? "text-rose-700" : "text-charcoal"}`}>
                Due {l.due}
              </p>
              {l.overdue && <p className="text-xs font-medium text-rose-600">Overdue — fines accruing</p>}
              <button type="button" className="mt-1 text-xs font-medium text-blue-600 hover:underline">
                Renew (demo)
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-blue-900">
          <ExternalLink className="h-4 w-4" /> Digital library access
        </h2>
        <p className="mt-1 text-sm text-blue-800">
          E-books, journals, and past exam papers — single sign-on from your student account.
          Production deployments connect EBSCO, JSTOR, or institutional repositories.
        </p>
      </div>
    </div>
  );
}
