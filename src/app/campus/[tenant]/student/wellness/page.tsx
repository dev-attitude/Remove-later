import { CalendarCheck, HeartPulse } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { WELLNESS_RESOURCES, WELLNESS_SLOTS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function WellnessPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Wellness Centre"
        description={`Counseling, health clinic bookings, and mental health resources at ${tenant.name}. Confidential and free for registered students.`}
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-charcoal">
          <CalendarCheck className="h-5 w-5" /> Available appointments
        </h2>
        <div className="space-y-3">
          {WELLNESS_SLOTS.map((s) => (
            <div
              key={s.slot + s.service}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-offwhite p-4"
            >
              <div>
                <p className="font-medium text-charcoal">{s.service}</p>
                <p className="text-xs text-muted">
                  {s.slot} · {s.provider}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg bg-charcoal px-3 py-2 text-xs font-medium text-offwhite"
              >
                Book (demo)
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-rose-900">
          <HeartPulse className="h-5 w-5" /> Resources & support
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-rose-900">
          {WELLNESS_RESOURCES.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-rose-700">
          Bookings are confidential — only the Wellness Centre sees your appointments.
        </p>
      </section>
    </div>
  );
}
