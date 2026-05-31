"use client";

import { GraduationCap } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { GeneratePanel } from "@/components/GeneratePanel";

const QUICK = [
  "Why did my hypothesis fail?",
  "What statistical test should I use?",
  "How do I write Chapter 4?",
  "Explain ANOVA in simple terms",
  "Viva preparation tips",
];

export default function TutorPage() {
  return (
    <>
      <ModuleHeader
        title="AI Research Tutor"
        description="Ask research questions, get statistics help, chapter guidance, and viva preparation."
        icon={GraduationCap}
      />
      <ModuleWorkspace>
        <div className="mb-6 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <span
              key={q}
              className="cursor-default rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
            >
              {q}
            </span>
          ))}
        </div>
        <Card>
          <CardTitle>Ask your tutor</CardTitle>
          <div className="mt-4">
            <GeneratePanel placeholder="Why did my hypothesis fail? My p-value was 0.08…" />
          </div>
        </Card>
      </ModuleWorkspace>
    </>
  );
}
