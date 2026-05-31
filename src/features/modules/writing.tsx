"use client";

import { useState } from "react";
import { PenTool } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { GeneratePanel } from "@/components/GeneratePanel";
import { WRITING_SECTIONS, SMART_TOOLS } from "@/lib/modules";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

export default function WritingPage() {
  const [section, setSection] = useState<string>(WRITING_SECTIONS[0]);
  const [tool, setTool] = useState<string>(SMART_TOOLS[0]);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"demo" | "live" | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateSection() {
    setLoading(true);
    setOutput("");
    const result = await generateText(`Generate ${section} for my research`, {
      portal: "student",
    });
    setOutput(result.content);
    setMode(result.mode);
    setLoading(false);
  }

  async function runTool() {
    setLoading(true);
    setOutput("");
    const result = await generateText(`Apply: ${tool}`, { portal: "student" });
    setOutput(result.content);
    setMode(result.mode);
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="AI Research Writing Assistant"
        description="Generate thesis sections, rewrite academically, humanize text, and write with citation awareness. Powered by GPT, academic fine-tunes, and RAG."
        icon={PenTool}
      />
      <ModuleWorkspace>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardTitle>Generate section</CardTitle>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Pick a chapter component and generate structured academic content.
            </p>
            <Select value={section} onChange={(e) => setSection(e.target.value)}>
              {WRITING_SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button className="mt-4" onClick={generateSection} disabled={loading}>
              Generate {section}
            </Button>
            <div className="mt-4">
              <AIOutput loading={loading} content={output} mode={mode} />
            </div>
          </Card>

          <Card>
            <CardTitle>Smart capabilities</CardTitle>
            <Select value={tool} onChange={(e) => setTool(e.target.value)}>
              {SMART_TOOLS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Button className="mt-4" variant="secondary" onClick={runTool} disabled={loading}>
              Run tool
            </Button>
            <p className="mt-4 text-xs text-slate-500">
              Models: GPT-4 class · Academic fine-tuned · RAG from your uploads
            </p>
          </Card>
        </div>

        <Card className="mt-8">
          <CardTitle>Free-form writing</CardTitle>
          <GeneratePanel placeholder="Topic: Impact of digital learning on nursing students in rural clinics…" />
        </Card>
      </ModuleWorkspace>
    </>
  );
}
