"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { AIOutput } from "@/components/AIOutput";
import { generateText } from "@/lib/client/api";
import { Sparkles } from "lucide-react";

export function GeneratePanel({
  label = "Your prompt or draft",
  placeholder = "Describe your research topic, paste a draft, or ask a question…",
  defaultPrompt = "",
  portal,
}: {
  label?: string;
  placeholder?: string;
  defaultPrompt?: string;
  portal?: string;
}) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"demo" | "live" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");
    setMode(null);
    try {
      const result = await generateText(prompt, { portal });
      setOutput(result.content);
      setMode(result.mode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <Textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        <Sparkles className="h-4 w-4" />
        Generate with GM AI
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <AIOutput loading={loading} content={output} mode={mode} />
    </div>
  );
}
