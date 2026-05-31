"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { WorkspaceHistory } from "@/components/WorkspaceHistory";
import { PROPOSAL_TEMPLATES } from "@/lib/modules";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";
import { usePortalId } from "@/hooks/usePortalId";
import { useWorkspace } from "@/hooks/useWorkspace";

const SECTIONS = [
  "Title page",
  "Introduction",
  "Literature review",
  "Methodology",
  "Budget",
  "Timeline",
  "References",
];

type ProposalForm = { template: string };
type ProposalResult = { output: string; mode: "demo" | "live" };

export default function ProposalsPage() {
  const portalId = usePortalId();
  const [loading, setLoading] = useState(false);

  const ws = useWorkspace<ProposalForm, ProposalResult>({
    portalId,
    moduleId: "proposals",
    defaultForm: { template: PROPOSAL_TEMPLATES[0] },
    makeTitle: (f, r) => `Proposal — ${f.template}${r ? "" : ""}`,
  });

  async function generate() {
    setLoading(true);
    try {
      const { content: text, mode } = await generateText(
        `Full research proposal for ${ws.form.template} discipline`,
        { portal: portalId }
      );
      const output = `# Research Proposal — ${ws.form.template}\n\n${SECTIONS.map((s) => `## ${s}\n[Generated section…]`).join("\n\n")}\n\n${text}`;
      ws.setResult({ output, mode });
    } finally {
      setLoading(false);
    }
  }

  if (!ws.hydrated) {
    return (
      <ModuleWorkspace>
        <p className="text-sm text-slate-500">Loading your saved work…</p>
      </ModuleWorkspace>
    );
  }

  return (
    <>
      <ModuleHeader
        title="Research Proposal Generator"
        description="Full proposals with discipline-specific templates. Your work is saved on this device."
        icon={FileText}
      />
      <ModuleWorkspace>
        <WorkspaceHistory
          items={ws.items}
          activeId={ws.activeId}
          onSelect={ws.loadItem}
          onDelete={ws.removeItem}
          onNew={ws.startNew}
        />
        <Card>
          <CardTitle>Template</CardTitle>
          <Select
            className="mt-3 max-w-xs"
            value={ws.form.template}
            onChange={(e) => ws.setForm({ template: e.target.value })}
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
            <AIOutput
              loading={loading}
              content={ws.result?.output ?? ""}
              mode={ws.result?.mode ?? null}
            />
          </div>
        </Card>
      </ModuleWorkspace>
    </>
  );
}
