"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GeneratePanel } from "@/components/GeneratePanel";

const JOURNALS = [
  { name: "Journal of Health Services Research", match: 92, reason: "Scope & methodology fit" },
  { name: "International Nursing Studies", match: 87, reason: "Audience alignment" },
  { name: "BMC Public Health", match: 81, reason: "Open access, impact factor" },
];

export default function JournalPage() {
  const [readiness] = useState(78);

  return (
    <>
      <ModuleHeader
        title="AI Journal Assistant"
        description="Journal recommendations, publication readiness, formatting, and reviewer response drafts."
        icon={Newspaper}
      />
      <ModuleWorkspace>
        <Card className="mb-6">
          <CardTitle>Publication readiness</CardTitle>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${readiness}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">{readiness}% — strengthen discussion & references</p>
        </Card>

        <Card className="mb-6">
          <CardTitle>Recommended journals</CardTitle>
          <ul className="mt-4 space-y-3">
            {JOURNALS.map((j) => (
              <li key={j.name} className="flex justify-between rounded-lg border border-slate-200 p-3 text-sm">
                <div>
                  <p className="font-medium">{j.name}</p>
                  <p className="text-slate-500">{j.reason}</p>
                </div>
                <span className="font-bold text-brand-600">{j.match}%</span>
              </li>
            ))}
          </ul>
          <Button className="mt-4" variant="secondary">
            Format for selected journal
          </Button>
        </Card>

        <Card>
          <CardTitle>Reviewer response generator</CardTitle>
          <GeneratePanel placeholder="Reviewer 2: The sample size appears insufficient…" />
        </Card>
      </ModuleWorkspace>
    </>
  );
}
