import { FileText, PlayCircle, Presentation } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { MY_MODULES } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

const MATERIAL_ICONS = { pdf: FileText, video: PlayCircle, slides: Presentation } as const;

export default async function MyModulesPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="My Modules"
        description={`Your registered modules at ${tenant.name} — lecturers, outlines, materials, and deadlines.`}
      />

      <div className="space-y-4">
        {MY_MODULES.map((m) => (
          <div key={m.code} className="rounded-xl border border-line bg-offwhite p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted">
                  {m.code} · {m.credits} credits
                </p>
                <h2 className="text-lg font-semibold text-charcoal">{m.title}</h2>
                <p className="mt-1 text-sm text-muted">{m.outline}</p>
              </div>
              {m.nextDeadline && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <p className="font-semibold">Next deadline</p>
                  <p>{m.nextDeadline.title}</p>
                  <p className="font-medium">Due {m.nextDeadline.due}</p>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-cream-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Lecturer
                </p>
                <p className="mt-1 text-sm font-medium text-charcoal">{m.lecturer}</p>
                <p className="text-xs text-muted">{m.lecturerEmail}</p>
              </div>
              <div className="rounded-lg bg-cream-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Learning materials
                </p>
                <ul className="mt-1 space-y-1">
                  {m.materials.map((mat) => {
                    const Icon = MATERIAL_ICONS[mat.type];
                    return (
                      <li key={mat.name} className="flex items-center gap-2 text-sm text-charcoal">
                        <Icon className="h-4 w-4 text-muted" />
                        <span className="hover:text-blue-700 hover:underline">{mat.name}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
