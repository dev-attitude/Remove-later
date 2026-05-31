"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PROPOSAL_TEMPLATES } from "@/lib/modules";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const SECTIONS = [
  "Title page",
  "Introduction",
  "Literature review",
  "Methodology",
  "Budget",
  "Timeline",
  "References",
];

export default function ProposalsPage() {
  const [template, setTemplate] = useState<string>(PROPOSAL_TEMPLATES[0]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setOutput("");
    const { content: text } = await generateText(
      `Full research proposal for ${template} discipline`,
      { portal: "student" }
    );
    setOutput(
      `# Research Proposal — ${template}\n\n${SECTIONS.map((s) => `## ${s}\n[Generated section…]`).join("\n\n")}\n\n${text}`
    );
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="Research Proposal Generator"
        description="Full proposals with discipline-specific templates: nursing, education, IT, business, and more."
        icon={FileText}
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Template</CardTitle>
          <Select
            className="mt-3 max-w-xs"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {PROPOSAL_TEMPLATES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Button className="mt-4" onClick={generate} disabled={loading}>
            Generate full proposal
          </Button>
          <div className="mt-6">
            <AIOutput loading={loading} content={output} />
          </div>
        </Card>
      </ModuleWorkspace>
    </>
  );
}
