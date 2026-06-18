"use client";

import { useState } from "react";

type PresetKey = "modules" | "graduate" | "excluded";

const PRESETS: Record<PresetKey, string> = {
  modules:
    "Based on your BEd Foundation Phase pathway, I recommend registering EDU201 (Literacy Methods), EDU205 (Classroom Management), and EDU210 (Practicum I) this semester. You have prerequisites met for all three.",
  graduate:
    "To graduate you need: 480 credits total, EDU400 capstone (not yet taken), 80% practicum attendance, and no outstanding fees above N$500. Estimated completion: 2 semesters if you pass all current modules.",
  excluded:
    "Academic exclusion applies when average mark falls below 45% for two consecutive semesters. Your Sem 1 average was 48% and Sem 2 was 42% — you may appeal within 14 days via the Registrar with a remediation plan.",
};

const PROMPTS: Record<PresetKey, string> = {
  modules: "Which modules should I register?",
  graduate: "What must I complete to graduate?",
  excluded: "Why am I academically excluded?",
};

export function AdvisorChat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "I'm your AI Academic Advisor. Ask about module registration, graduation requirements, or academic standing.",
    },
  ]);
  const [input, setInput] = useState("");

  function ask(preset: PresetKey) {
    const userText = PROMPTS[preset];
    setMessages((m) => [
      ...m,
      { role: "user", text: userText },
      { role: "assistant", text: PRESETS[preset] },
    ]);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    let reply =
      "I can help with module selection, graduation pathways, and policy explanations. Try one of the quick questions below, or connect OpenAI in production for full conversational advising.";
    const lower = text.toLowerCase();
    if (lower.includes("module") || lower.includes("register")) reply = PRESETS.modules;
    else if (lower.includes("graduat")) reply = PRESETS.graduate;
    else if (lower.includes("exclud")) reply = PRESETS.excluded;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: reply }]);
  }

  return (
    <div className="rounded-xl border border-line bg-offwhite">
      <div className="max-h-80 space-y-3 overflow-y-auto border-b border-line p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.role === "user" ? "ml-8 bg-blue-600 text-offwhite" : "mr-8 bg-line text-charcoal"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-line p-3">
        <button type="button" onClick={() => ask("modules")} className="rounded-full bg-line px-3 py-1 text-xs">
          Module registration
        </button>
        <button type="button" onClick={() => ask("graduate")} className="rounded-full bg-line px-3 py-1 text-xs">
          Graduation pathway
        </button>
        <button type="button" onClick={() => ask("excluded")} className="rounded-full bg-line px-3 py-1 text-xs">
          Academic exclusion
        </button>
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your advisor…"
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-charcoal px-4 py-2 text-sm text-offwhite">
          Send
        </button>
      </form>
    </div>
  );
}
