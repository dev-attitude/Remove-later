"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

export default function TranscriptionPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function transcribe() {
    setLoading(true);
    setOutput("");
    const { content: text } = await generateText(
      "Transcribe interview with speaker labels and timestamps. Extract key quotes and themes.",
      { portal: "analysis" }
    );
    setOutput(
      `[00:00:12] Interviewer: Can you describe your experience?\n[00:00:18] Participant A: The policy changed how we collect data…\n[00:01:04] Participant B: We needed more training on ethics.\n\n--- Key quotes ---\n• "The policy changed how we collect data"\n• "We needed more training on ethics"\n\n--- Themes ---\n1. Institutional policy impact\n2. Capacity building needs\n\n${text}`
    );
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="Audio & Transcription"
        description="Speech-to-text for interviews and lectures. Speaker ID, translation, timestamps, and theme extraction."
        icon={Mic}
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Upload media</CardTitle>
          <p className="text-sm text-slate-500">MP3, WAV, MP4, voice notes</p>
          <input type="file" className="mt-4 text-sm" accept="audio/*,video/*" />
          <div className="mt-4 flex flex-wrap gap-2">
            {["Transcribe", "Translate", "Summarize", "Extract themes"].map((f) => (
              <Button key={f} variant="outline" size="sm">
                {f}
              </Button>
            ))}
          </div>
          <Button className="mt-6" onClick={transcribe} disabled={loading}>
            Start transcription
          </Button>
          <div className="mt-4">
            <AIOutput loading={loading} content={output} />
          </div>
        </Card>
      </ModuleWorkspace>
    </>
  );
}
