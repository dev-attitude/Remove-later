"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import type { ClassStudent } from "@/lib/campus/management-data";

type Tab = "attendance" | "marks";

export function LecturerClassTools({ roster }: { roster: ClassStudent[] }) {
  const [tab, setTab] = useState<Tab>("attendance");
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(roster.map((s) => [s.studentNumber, true]))
  );
  const [marks, setMarks] = useState<Record<string, string>>(
    Object.fromEntries(roster.map((s) => [s.studentNumber, s.currentMark?.toString() ?? ""]))
  );
  const [saved, setSaved] = useState<string | null>(null);

  function save() {
    setSaved(
      tab === "attendance"
        ? `Attendance captured for ${Object.values(present).filter(Boolean).length}/${roster.length} students (demo).`
        : "Marks saved to the gradebook (demo — pending moderation)."
    );
  }

  return (
    <div className="rounded-xl border border-line bg-offwhite">
      <div className="flex border-b border-line">
        {(
          [
            ["attendance", "Attendance capture"],
            ["marks", "Mark entry"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setSaved(null);
            }}
            className={`px-4 py-3 text-sm font-medium ${
              tab === id
                ? "border-b-2 border-charcoal text-charcoal"
                : "text-muted hover:text-charcoal"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-cream-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Attendance to date</th>
              <th className="px-4 py-3">
                {tab === "attendance" ? "Today's session" : "Mark (%)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.studentNumber} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{s.name}</p>
                  <p className="text-xs text-muted">{s.studentNumber}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      s.attendancePct >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {s.attendancePct}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  {tab === "attendance" ? (
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={present[s.studentNumber]}
                        onChange={(e) =>
                          setPresent((p) => ({ ...p, [s.studentNumber]: e.target.checked }))
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-xs text-muted">
                        {present[s.studentNumber] ? "Present" : "Absent"}
                      </span>
                    </label>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={marks[s.studentNumber]}
                      onChange={(e) =>
                        setMarks((m) => ({ ...m, [s.studentNumber]: e.target.value }))
                      }
                      placeholder="—"
                      className="w-20 rounded-lg border border-line px-2 py-1 text-sm"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 border-t border-line p-3">
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-offwhite"
        >
          <Save className="h-4 w-4" /> Save {tab === "attendance" ? "attendance" : "marks"}
        </button>
        {saved && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {saved}
          </p>
        )}
      </div>
    </div>
  );
}
