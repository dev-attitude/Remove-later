"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { AIOutput } from "@/components/AIOutput";
import { WorkspaceHistory } from "@/components/WorkspaceHistory";
import { generateText } from "@/lib/client/api";
import { usePortalId } from "@/hooks/usePortalId";
import { isPortalId } from "@/lib/portals";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Sparkles } from "lucide-react";

type FreeformForm = { prompt: string };
type FreeformResult = { content: string; mode: "demo" | "live" };

export function GeneratePanel({
  label = "Your prompt or draft",
  placeholder = "Describe your research topic, paste a draft, or ask a question…",
  defaultPrompt = "",
  portal,
  workspaceModuleId = "freeform",
}: {
  label?: string;
  placeholder?: string;
  defaultPrompt?: string;
  portal?: string;
  workspaceModuleId?: string;
}) {
  const portalFromRoute = usePortalId();
  const portalId = portal && isPortalId(portal) ? portal : portalFromRoute;
  const moduleId = workspaceModuleId;

  const ws = useWorkspace<FreeformForm, FreeformResult>({
    portalId,
    moduleId,
    defaultForm: { prompt: defaultPrompt },
    makeTitle: (f, r) =>
      r?.content?.slice(0, 50)?.trim() ||
      f.prompt.trim().slice(0, 50) ||
      "Free-form prompt",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const prompt = ws.form.prompt;
  const output = ws.result?.content ?? "";
  const mode = ws.result?.mode ?? null;

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await generateText(prompt, { portal: portalId });
      ws.setResult({ content: result.content, mode: result.mode });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ws.hydrated) return null;

  return (
    <div className="space-y-4">
      <WorkspaceHistory
        items={ws.items}
        activeId={ws.activeId}
        onSelect={ws.loadItem}
        onDelete={ws.removeItem}
        onNew={ws.startNew}
        label="Saved prompts"
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
        <Textarea
          rows={5}
          value={prompt}
          onChange={(e) => ws.setForm({ prompt: e.target.value })}
          placeholder={placeholder}
        />
      </div>
      <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        <Sparkles className="h-4 w-4" />
        Generate with Skyrapay AI
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <AIOutput loading={loading} content={output} mode={mode} />
    </div>
  );
}
