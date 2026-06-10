import { CalendarDays, Trophy, Users } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CAMPUS_EVENTS, CLUBS, SPORTS_FIXTURES } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function EventsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Events, Clubs & Sports"
        description={`Campus life at ${tenant.name} — events, workshops, societies, and sports.`}
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <CalendarDays className="h-5 w-5" /> Upcoming events
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPUS_EVENTS.map((e) => (
            <div key={e.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                {e.category}
              </span>
              <p className="mt-2 font-semibold text-slate-900">{e.title}</p>
              <p className="text-xs text-slate-500">
                {e.date} · {e.venue}
              </p>
              <button type="button" className="mt-2 text-xs font-medium text-blue-600 hover:underline">
                RSVP (demo)
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5" /> Clubs & societies
          </h2>
          <div className="space-y-2">
            {CLUBS.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.members} members</p>
                </div>
                {c.joined ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Member
                  </span>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Join (demo)
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Trophy className="h-5 w-5" /> Sports fixtures
          </h2>
          <div className="space-y-2">
            {SPORTS_FIXTURES.map((f) => (
              <div key={f.fixture} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{f.sport}</p>
                <p className="font-medium text-slate-900">{f.fixture}</p>
                <p className="text-xs text-slate-500">
                  {f.date} ·{" "}
                  <span className={f.result === "Upcoming" ? "text-blue-600" : "text-emerald-700"}>
                    {f.result}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
