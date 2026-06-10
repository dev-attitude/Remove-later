import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { BookOpen, MessageSquare, FileQuestion, Video } from "lucide-react";

type Props = { params: Promise<{ tenant: string }> };

const COURSES = [
  { code: "EDU101", title: "Introduction to Pedagogy", students: 124, progress: 68 },
  { code: "CS201", title: "Data Structures", students: 89, progress: 54 },
  { code: "NUR301", title: "Clinical Practice", students: 42, progress: 81 },
];

export default async function LmsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Learning Management System"
        description={`Built-in LMS for ${tenant.name} — courses, videos, quizzes, assignments, and forums without Moodle or Canvas.`}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { icon: Video, label: "Video lectures" },
          { icon: FileQuestion, label: "Quizzes" },
          { icon: BookOpen, label: "Assignments" },
          { icon: MessageSquare, label: "Discussion forums" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            <Icon className="h-4 w-4" />
            {label}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {COURSES.map((c) => (
          <div key={c.code} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-500">{c.code}</p>
                <p className="font-semibold text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500">{c.students} enrolled</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{c.progress}%</p>
                <p className="text-xs text-slate-500">avg. completion</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${c.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
