"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import type { RegistrableModule } from "@/lib/campus/student";

type Props = {
  registered: RegistrableModule[];
  available: RegistrableModule[];
};

export function StudentRegistration({ registered, available }: Props) {
  const [added, setAdded] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const myModules = [...registered, ...available.filter((m) => added.includes(m.code))];
  const remaining = available.filter((m) => !added.includes(m.code));
  const totalCredits = myModules.reduce((sum, m) => sum + m.credits, 0);

  function register(mod: RegistrableModule) {
    setAdded((prev) => [...prev, mod.code]);
    setConfirmation(`${mod.code} added to your registration (demo — no real enrollment).`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-charcoal">
          My registration <span className="text-sm font-normal text-muted">({totalCredits} credits)</span>
        </h2>
        <div className="space-y-3">
          {myModules.map((m) => (
            <div key={m.code} className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium text-charcoal">
                  {m.code} — {m.title}
                </p>
                <p className="text-xs text-muted">
                  {m.credits} credits · {m.semester}
                </p>
              </div>
            </div>
          ))}
        </div>
        {confirmation && (
          <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{confirmation}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-charcoal">Available modules</h2>
        <div className="space-y-3">
          {remaining.map((m) => (
            <div key={m.code} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-offwhite p-4">
              <div>
                <p className="font-medium text-charcoal">
                  {m.code} — {m.title}
                </p>
                <p className="text-xs text-muted">
                  {m.credits} credits · {m.semester}
                </p>
                {!m.prerequisiteMet && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <Lock className="h-3 w-3" /> Prerequisite not met
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={!m.prerequisiteMet}
                onClick={() => register(m)}
                className="shrink-0 rounded-lg bg-charcoal px-3 py-1.5 text-xs font-medium text-offwhite disabled:cursor-not-allowed disabled:opacity-40"
              >
                Register
              </button>
            </div>
          ))}
          {remaining.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-offwhite p-4 text-sm text-muted">
              No further modules available this semester.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
