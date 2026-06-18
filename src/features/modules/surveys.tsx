"use client";

import { ClipboardList } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GeneratePanel } from "@/components/GeneratePanel";

const SAMPLE_QUESTIONS = [
  { q: "How satisfied are you with the training provided?", bias: "OK" },
  { q: "Don't you agree the program was excellent?", bias: "Leading question" },
  { q: "Rate your experience from 1–5", bias: "OK" },
];

export default function SurveysPage() {
  return (
    <>
      <ModuleHeader
        title="Survey & Data Collection"
        description="Build questionnaires, online/mobile/offline surveys. AI suggests questions and detects bias."
        icon={ClipboardList}
        moduleId="surveys"
      />
      <ModuleWorkspace>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Questionnaire builder</CardTitle>
            <ul className="mt-4 space-y-2">
              {SAMPLE_QUESTIONS.map((item, i) => (
                <li
                  key={i}
                  className={`rounded-lg border p-3 text-sm ${
                    item.bias !== "OK"
                      ? "border-red-200 bg-red-50"
                      : "border-line"
                  }`}
                >
                  <p>{item.q}</p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      item.bias !== "OK" ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {item.bias === "OK" ? "Validated" : `⚠ ${item.bias}`}
                  </p>
                </li>
              ))}
            </ul>
            <Button className="mt-4" variant="secondary">
              Validate questionnaire
            </Button>
          </Card>
          <Card>
            <CardTitle>AI question suggestions</CardTitle>
            <GeneratePanel placeholder="Topic: employee wellbeing in healthcare…" />
          </Card>
        </div>
        <p className="mt-6 text-sm text-muted">
          Modes: online surveys · mobile app · offline collection with sync
        </p>
      </ModuleWorkspace>
    </>
  );
}
