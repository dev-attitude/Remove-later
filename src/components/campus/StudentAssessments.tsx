"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Upload } from "lucide-react";
import type { Assessment } from "@/lib/campus/student-data";

const TYPE_STYLES: Record<Assessment["type"], string> = {
  assignment: "bg-blue-100 text-blue-800",
  quiz: "bg-violet-100 text-violet-800",
  test: "bg-amber-100 text-amber-800",
};

export function StudentAssessments({ assessments }: { assessments: Assessment[] }) {
  const [submitted, setSubmitted] = useState<string[]>([]);

  const open = assessments.filter((a) => a.status === "open" && !submitted.includes(a.id));
  const pending = assessments.filter((a) => a.status === "submitted" || submitted.includes(a.id));
  const graded = assessments.filter((a) => a.status === "graded");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Due now <span className="text-sm font-normal text-slate-500">({open.length})</span>
        </h2>
        <div className="space-y-3">
          {open.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_STYLES[a.type]}`}>
                    {a.type}
                  </span>
                  <p className="font-medium text-slate-900">{a.title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {a.module} · Due {a.due}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted((s) => [...s, a.id])}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
              >
                <Upload className="h-3.5 w-3.5" /> Submit (demo)
              </button>
            </div>
          ))}
          {open.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              Nothing due — you are up to date.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Awaiting grading</h2>
        <div className="space-y-3">
          {pending.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <Clock className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-xs text-slate-500">{a.module} · Submitted</p>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-sm text-slate-500">No submissions awaiting grades.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Graded</h2>
        <div className="space-y-3">
          {graded.map((a) => (
            <div key={a.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-600">{a.module}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-800">{a.mark}%</span>
              </div>
              {a.feedback && (
                <p className="mt-2 rounded-lg bg-white/70 p-2 text-sm text-slate-700">
                  <span className="font-medium">Feedback:</span> {a.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
