import Link from "next/link";
import { BookOpen, CheckCircle2, FlaskConical } from "lucide-react";
import { COMPANY } from "@/lib/site-content";
import { STUDENT_ASSISTANCE_AREAS } from "@/lib/student-assistance";

export function StudentAssistanceSection() {
  return (
    <div className="mt-16 space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-navy">How we help students</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Whether you need help with a single assignment or a full research project, we work with
          you step by step—writing, research design, data collection, and analysis.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {STUDENT_ASSISTANCE_AREAS.map((area) => (
            <article key={area.id} className="marketing-service-card flex flex-col">
              <div className="flex items-start gap-3">
                <BookOpen className="h-6 w-6 shrink-0 text-royal" />
                <div>
                  <h3 className="text-lg font-bold text-navy">{area.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{area.description}</p>
                </div>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                {area.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-royal/20 bg-gradient-to-br from-brand-50 to-white p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-royal">Also available</p>
            <h3 className="mt-2 text-xl font-bold text-navy">{COMPANY.productName}</h3>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Self-service AI tools for writing, literature search, citations, research topics,
              plagiarism checks, and more—ideal alongside one-on-one student assistance.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href={COMPANY.researchAppPath} className="marketing-btn-primary inline-flex text-sm">
              <FlaskConical className="h-4 w-4" />
              Open Research Suite
            </Link>
            <Link
              href="/contact?service=student-assistance"
              className="marketing-btn-secondary inline-flex text-sm"
            >
              Request assistance
            </Link>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-slate-500">
        We support academic integrity. Submit work that meets your institution&apos;s policies;
        we provide guidance and drafts for your review and learning.
      </p>
    </div>
  );
}
