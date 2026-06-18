"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { MessageThread } from "@/lib/campus/student-data";

export function StudentMessages({ threads: initial }: { threads: MessageThread[] }) {
  const [threads, setThreads] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id);
  const [draft, setDraft] = useState("");

  const active = threads.find((t) => t.id === activeId);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setDraft("");
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                { from: "me" as const, text, at: "Just now" },
                {
                  from: "them" as const,
                  text: "Thanks — received. We will respond within one working day. (demo auto-reply)",
                  at: "Just now",
                },
              ],
            }
          : t
      )
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="rounded-xl border border-line bg-offwhite p-2">
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveId(t.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
              t.id === activeId ? "bg-charcoal text-offwhite" : "text-charcoal hover:bg-line"
            }`}
          >
            <p className="font-medium">{t.with}</p>
            <p className={`text-xs ${t.id === activeId ? "text-offwhite/70" : "text-muted"}`}>
              {t.department}
            </p>
          </button>
        ))}
        <button
          type="button"
          className="mt-2 w-full rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-muted hover:bg-cream-50"
        >
          + New message (demo)
        </button>
      </div>

      {active && (
        <div className="flex flex-col rounded-xl border border-line bg-offwhite">
          <div className="border-b border-line p-4">
            <p className="font-semibold text-charcoal">{active.subject}</p>
            <p className="text-xs text-muted">
              {active.with} · {active.department}
            </p>
          </div>
          <div className="max-h-96 flex-1 space-y-3 overflow-y-auto p-4">
            {active.messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.from === "me"
                    ? "ml-auto bg-blue-600 text-offwhite"
                    : "bg-line text-charcoal"
                }`}
              >
                <p>{m.text}</p>
                <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-offwhite/70" : "text-muted"}`}>
                  {m.at}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-offwhite"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
