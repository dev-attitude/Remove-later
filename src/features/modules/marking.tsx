"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const SUBMISSIONS = [
  {
    student: "Ama Kofi",
    title: "Chapter 3 — Methodology",
    status: "Awaiting mark",
    aiScore: 18,
    plagiarism: 9,
  },
  {
    student: "James Osei",
    title: "Full thesis draft",
    status: "In review",
    aiScore: 42,
    plagiarism: 14,
  },
  {
    student: "Sarah Mensah",
    title: "Chapter 4 — Findings",
    status: "Marked",
    aiScore: 12,
    plagiarism: 6,
  },
];

const RUBRIC = [
  { criterion: "Clarity & structure", max: 25 },
  { criterion: "Methodological rigor", max: 25 },
  { criterion: "Critical analysis", max: 25 },
  { criterion: "Referencing & integrity", max: 25 },
];

export default function MarkingModule() {
  const [selected, setSelected] = useState(0);
  const sub = SUBMISSIONS[selected];

  return (
    <>
      <ModuleHeader
        title="Research Marking Workspace"
        description="Batch grade submissions, apply rubrics, run integrity checks, and return feedback to students."
        icon={ClipboardCheck}
      />
      <ModuleWorkspace>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardTitle>Submission queue</CardTitle>
            <ul className="mt-4 space-y-2">
              {SUBMISSIONS.map((s, i) => (
                <li key={s.student}>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                      selected === i
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-medium">{s.student}</p>
                    <p className="text-slate-500">{s.title}</p>
                    <p className="mt-1 text-xs text-indigo-600">{s.status}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardTitle>{sub.student} — {sub.title}</CardTitle>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                  AI detection: {sub.aiScore}%
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                  Plagiarism: {sub.plagiarism}%
                </span>
              </div>
              <label className="mt-4 block text-sm font-medium">Rubric template</label>
              <Select className="mt-1 max-w-xs">
                <option>Masters thesis — standard</option>
                <option>Undergraduate dissertation</option>
                <option>Research proposal</option>
              </Select>
              <div className="mt-4 space-y-3">
                {RUBRIC.map((r) => (
                  <div key={r.criterion} className="flex items-center justify-between gap-4">
                    <span className="text-sm">{r.criterion}</span>
                    <input
                      type="number"
                      min={0}
                      max={r.max}
                      defaultValue={Math.floor(r.max * 0.8)}
                      className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-slate-400">/ {r.max}</span>
                  </div>
                ))}
              </div>
              <textarea
                className="mt-4 w-full rounded-lg border border-slate-300 p-3 text-sm"
                rows={4}
                placeholder="Marker feedback to student…"
                defaultValue="Strong methodology section. Clarify sampling frame in §3.2."
              />
              <Button className="mt-4">Submit marks & feedback</Button>
            </Card>
          </div>
        </div>
      </ModuleWorkspace>
    </>
  );
}
