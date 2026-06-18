import { Bell, Building2, GraduationCap, Megaphone } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { ANNOUNCEMENTS, NOTIFICATIONS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

const SCOPE_META = {
  university: { label: "University", icon: Building2, style: "bg-blue-100 text-blue-800" },
  faculty: { label: "Faculty", icon: GraduationCap, style: "bg-violet-100 text-violet-800" },
  department: { label: "Department", icon: Megaphone, style: "bg-emerald-100 text-emerald-800" },
} as const;

const NOTIF_STYLE: Record<string, string> = {
  results: "bg-emerald-50 text-emerald-900 border-emerald-200",
  registration: "bg-blue-50 text-blue-900 border-blue-200",
  fees: "bg-amber-50 text-amber-900 border-amber-200",
  deadline: "bg-rose-50 text-rose-900 border-rose-200",
};

export default async function AnnouncementsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Announcements & Notifications"
        description={`Institution, faculty, and department news at ${tenant.name} — plus your personal notification centre.`}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-charcoal">Announcements</h2>
          <div className="space-y-3">
            {ANNOUNCEMENTS.map((a) => {
              const meta = SCOPE_META[a.scope];
              return (
                <div key={a.title} className="rounded-xl border border-line bg-offwhite p-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${meta.style}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-muted">{a.date}</span>
                  </div>
                  <p className="mt-2 font-semibold text-charcoal">{a.title}</p>
                  <p className="mt-1 text-sm text-muted">{a.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-charcoal">
            <Bell className="h-5 w-5" /> Notification centre
          </h2>
          <div className="space-y-2">
            {NOTIFICATIONS.map((n) => (
              <div key={n.text} className={`rounded-lg border p-3 text-sm ${NOTIF_STYLE[n.kind]}`}>
                <p className="font-medium">{n.text}</p>
                <p className="mt-0.5 text-[11px] opacity-70">{n.at}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
