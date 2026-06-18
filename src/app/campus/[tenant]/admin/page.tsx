import { Megaphone, MapPin, Users } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import {
  ACADEMIC_YEAR,
  GLOBAL_ANNOUNCEMENTS,
  INSTITUTION_USERS,
} from "@/lib/campus/management-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function InstitutionAdminPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Institution Admin"
        title="Institution Administration"
        description={`Setup, campuses, academic year, users, and announcements for ${tenant.name}.`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-charcoal">
            <MapPin className="h-5 w-5" /> Campuses
          </h2>
          <ul className="mt-3 space-y-2">
            {tenant.campuses.map((c) => (
              <li
                key={c}
                className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-charcoal">{c}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  active
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-3 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream-50"
          >
            + Add campus (demo)
          </button>
        </section>

        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="text-lg font-semibold text-charcoal">
            Academic year {ACADEMIC_YEAR.current}
          </h2>
          <div className="mt-3 space-y-2">
            {ACADEMIC_YEAR.semesters.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-charcoal">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.start} → {s.end}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    s.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream-50"
          >
            Configure {Number(ACADEMIC_YEAR.current) + 1} (demo)
          </button>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-charcoal">
          <Users className="h-5 w-5" /> User management
        </h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-offwhite">
          <table className="min-w-full text-sm">
            <thead className="border-b border-line bg-cream-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {INSTITUTION_USERS.map((u) => (
                <tr key={u.email} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-charcoal">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 text-charcoal">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-offwhite"
        >
          + Invite user (demo)
        </button>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-charcoal">
          <Megaphone className="h-5 w-5" /> Global announcements
        </h2>
        <div className="space-y-2">
          {GLOBAL_ANNOUNCEMENTS.map((a) => (
            <div
              key={a.title}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-offwhite p-4"
            >
              <div>
                <p className="font-medium text-charcoal">{a.title}</p>
                <p className="text-xs text-muted">
                  To: {a.audience} · Sent {a.sent}
                </p>
              </div>
              <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                Resend (demo)
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream-50"
        >
          + New announcement (demo)
        </button>
      </section>
    </div>
  );
}
