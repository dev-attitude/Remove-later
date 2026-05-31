"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CITATION_STYLES } from "@/lib/modules";

const SAMPLE_REF = {
  "APA 7":
    "Smith, J. A., & Lee, M. K. (2024). Digital health in rural communities. Journal of Nursing Research, 12(3), 45–58. https://doi.org/10.1000/xyz",
  Harvard:
    "Smith, JA and Lee, MK (2024) 'Digital health in rural communities', Journal of Nursing Research, 12(3), pp. 45-58.",
  MLA:
    'Smith, John A., and Maria K. Lee. "Digital Health in Rural Communities." Journal of Nursing Research, vol. 12, no. 3, 2024, pp. 45-58.',
  Chicago:
    "Smith, John A., and Maria K. Lee. 2024. \"Digital Health in Rural Communities.\" Journal of Nursing Research 12 (3): 45-58.",
  Vancouver:
    "Smith JA, Lee MK. Digital health in rural communities. J Nurs Res. 2024;12(3):45-58.",
};

export default function CitationsPage() {
  const [style, setStyle] = useState<(typeof CITATION_STYLES)[number]>("APA 7");
  const [doi, setDoi] = useState("10.1000/xyz");

  return (
    <>
      <ModuleHeader
        title="Citation & Referencing"
        description="APA, Harvard, MLA, Chicago, Vancouver. DOI lookup, in-text citations, bibliography builder."
        icon={Quote}
      />
      <ModuleWorkspace>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Reference generator</CardTitle>
            <label className="mt-3 block text-sm font-medium">Style</label>
            <Select value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
              {CITATION_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <label className="mt-4 block text-sm font-medium">DOI lookup</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
            <Button className="mt-4">Verify & generate</Button>
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
              {SAMPLE_REF[style]}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              In-text ({style}): (Smith & Lee, 2024)
            </p>
          </Card>
          <Card>
            <CardTitle>Advanced</CardTitle>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Browser extension for one-click cite</li>
              <li>• Citation from PDF metadata</li>
              <li>• Auto bibliography export (.bib, .docx)</li>
            </ul>
          </Card>
        </div>
      </ModuleWorkspace>
    </>
  );
}
