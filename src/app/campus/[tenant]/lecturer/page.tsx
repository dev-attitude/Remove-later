import Link from "next/link";
import { BookOpen, MessageSquare, Upload } from "lucide-react";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { LecturerClassTools } from "@/components/campus/LecturerClassTools";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CLASS_ROSTER, LECTURER_CLASSES } from "@/lib/campus/management-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function LecturerPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Lecturer"
        title="Lecturer Portal"
        description={`Your classes at ${tenant.name} — attendance capture, mark entry, materials, and student communication.`}
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-charcoal">My classes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {LECTURER_CLASSES.map((c) => (
            <div key={c.code} className="rounded-xl border border-line bg-offwhite p-4">
              <p className="text-xs font-medium text-muted">{c.code}</p>
              <p className="font-semibold text-charcoal">{c.title}</p>
              <p className="mt-1 text-xs text-muted">
                {c.students} students · Next: {c.nextSession} · {c.venue}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-charcoal hover:bg-cream-50"
                >
                  <Upload className="h-3 w-3" /> Upload materials (demo)
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-charcoal hover:bg-cream-50"
                >
                  <MessageSquare className="h-3 w-3" /> Message class (demo)
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-charcoal">
          EDU301 — Curriculum Design <span className="text-sm font-normal text-muted">(class tools)</span>
        </h2>
        <LecturerClassTools roster={CLASS_ROSTER} />
        <p className="mt-3 text-xs text-muted">
          Saved marks flow to the Examination Office for moderation before publication. Attendance
          feeds the Student Success AI risk models.
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-blue-900">
          <BookOpen className="h-5 w-5" /> Assessment creation
        </h2>
        <p className="mt-1 text-sm text-blue-800">
          Create assignments, quizzes, and tests that appear instantly in students&apos; Assessment
          Centres — with deadlines, rubrics, and AI-assisted question generation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["New assignment", "New quiz", "New test"].map((b) => (
            <button
              key={b}
              type="button"
              className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-offwhite"
            >
              {b} (demo)
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-blue-700">
          Students see these in{" "}
          <Link href={`/campus/${slug}/student/assessments`} className="underline">
            their Assessment Centre
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
