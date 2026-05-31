"use client";

import { useState } from "react";
import { Presentation } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const OUTPUT_TYPES = ["PowerPoint slides", "Academic poster", "Conference abstract", "Oral notes"];

export default function PresentationsPage() {
  const [type, setType] = useState(OUTPUT_TYPES[0]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setOutput("");
    const { content: text } = await generateText(`Generate ${type} from thesis outline`, {
      portal: "student",
    });
    setOutput(
      `Slide 1: Title & authors\nSlide 2: Background\nSlide 3: Objectives\nSlide 4: Methodology\nSlide 5: Key findings (with chart)\nSlide 6: Discussion\nSlide 7: Conclusion & questions\n\n${text}`
    );
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="Research Presentation Generator"
        description="Turn thesis into slides, posters, conference abstracts, and oral presentation notes."
        icon={Presentation}
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Output type</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {OUTPUT_TYPES.map((t) => (
              <Button
                key={t}
                variant={type === t ? "primary" : "outline"}
                size="sm"
                onClick={() => setType(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <Button className="mt-6" onClick={generate} disabled={loading}>
            Generate {type}
          </Button>
          <div className="mt-4">
            <AIOutput loading={loading} content={output} />
          </div>
        </Card>
      </ModuleWorkspace>
    </>
  );
}
