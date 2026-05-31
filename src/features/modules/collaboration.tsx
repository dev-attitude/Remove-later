import { Users } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";

const MESSAGES = [
  { from: "Dr. Mensah (Supervisor)", text: "Strengthen your problem statement in §1.2.", time: "2h ago" },
  { from: "You", text: "Updated draft uploaded — please review methodology.", time: "Yesterday" },
];

const VERSIONS = [
  { v: "v1.4", date: "May 28", status: "Pending approval" },
  { v: "v1.3", date: "May 20", status: "Approved" },
  { v: "v1.2", date: "May 12", status: "Approved" },
];

export default function CollaborationPage() {
  return (
    <>
      <ModuleHeader
        title="Supervisor & Collaboration"
        description="Student-supervisor chat, live comments, version history, shared editing, and approval workflows."
        icon={Users}
      />
      <ModuleWorkspace>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Supervisor chat</CardTitle>
            <ul className="mt-4 space-y-3">
              {MESSAGES.map((m, i) => (
                <li key={i} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-brand-700">{m.from}</p>
                  <p className="text-slate-700">{m.text}</p>
                  <p className="mt-1 text-xs text-slate-400">{m.time}</p>
                </li>
              ))}
            </ul>
            <input
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Type a message…"
            />
          </Card>
          <Card>
            <CardTitle>Version history</CardTitle>
            <ul className="mt-4 space-y-2">
              {VERSIONS.map((v) => (
                <li
                  key={v.v}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{v.v}</span>
                  <span className="text-slate-500">{v.date}</span>
                  <span
                    className={
                      v.status === "Approved"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Institution: department dashboards, research tracking, progress monitoring
            </p>
          </Card>
        </div>
      </ModuleWorkspace>
    </>
  );
}
