import { Home, Wrench } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { formatCampusCurrency } from "@/lib/campus/data";
import { HOSTEL } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

const STATUS_STYLES: Record<string, string> = {
  "in progress": "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  pending: "bg-slate-100 text-slate-700",
};

export default async function HostelPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Hostel Portal"
        description={`Room allocation, hostel fees, and maintenance requests at ${tenant.name}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Home className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-wide">My allocation</p>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">{HOSTEL.residence}</p>
          <p className="text-sm text-slate-600">{HOSTEL.room}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Hostel fees outstanding
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-900">
            {formatCampusCurrency(HOSTEL.feesOutstanding)}
          </p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Pay from wallet (demo)
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Maintenance requests</h2>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Wrench className="h-3.5 w-3.5" /> Log new request (demo)
          </button>
        </div>
        <div className="space-y-3">
          {HOSTEL.maintenanceRequests.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{r.issue}</p>
                <p className="text-xs text-slate-500">Logged {r.logged}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
