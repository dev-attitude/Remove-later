import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getStudentRecord } from "@/lib/campus/student";

type Props = { params: Promise<{ tenant: string }> };

export default async function SettingsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const student = await getStudentRecord(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Settings"
        description="Profile details and notification preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="text-lg font-semibold text-charcoal">My profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Name", student.name],
              ["Student number", student.studentNumber],
              ["Programme", student.programme],
              ["Institution", tenant.name],
              ["Enrolled since", String(student.enrollmentYear)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0">
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium text-charcoal">{value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className="mt-4 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream-50"
          >
            Request profile update (demo)
          </button>
        </section>

        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="text-lg font-semibold text-charcoal">Notifications</h2>
          <p className="mt-1 text-sm text-muted">
            Choose how you receive alerts for results, fees, deadlines, and announcements.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {["Email", "SMS", "Push (mobile app)", "WhatsApp"].map((channel, i) => (
              <label key={channel} className="flex items-center justify-between gap-4">
                <span className="text-charcoal">{channel}</span>
                <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4" />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
