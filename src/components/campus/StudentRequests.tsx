"use client";

import { useState } from "react";
import { REQUEST_TYPES, type ServiceRequest } from "@/lib/campus/student-data";

const STATUS_STYLES: Record<ServiceRequest["status"], string> = {
  pending: "bg-line text-charcoal",
  processing: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export function StudentRequests({ existing }: { existing: ServiceRequest[] }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(existing);
  const [type, setType] = useState<string>(REQUEST_TYPES[0]);
  const [note, setNote] = useState("");
  const [complaint, setComplaint] = useState("");
  const [complaintSent, setComplaintSent] = useState(false);

  function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setRequests((prev) => [
      {
        id: `r${Date.now()}`,
        type,
        submitted: new Date().toISOString().slice(0, 10),
        status: "pending",
      },
      ...prev,
    ]);
    setNote("");
  }

  function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!complaint.trim()) return;
    setComplaint("");
    setComplaintSent(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="text-lg font-semibold text-charcoal">New request</h2>
          <form onSubmit={submitRequest} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-charcoal">Request type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                placeholder="Any supporting details…"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-offwhite"
            >
              Submit request (demo)
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-line bg-offwhite p-5">
          <h2 className="text-lg font-semibold text-charcoal">Complaint or suggestion</h2>
          <form onSubmit={submitComplaint} className="mt-4 space-y-3">
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              placeholder="Describe your complaint or suggestion…"
            />
            <button
              type="submit"
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-charcoal hover:bg-cream-50"
            >
              Send to Student Affairs (demo)
            </button>
            {complaintSent && (
              <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">
                Received — you can track resolution under &quot;My requests&quot;.
              </p>
            )}
          </form>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-charcoal">My requests</h2>
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-offwhite p-4"
            >
              <div>
                <p className="font-medium text-charcoal">{r.type}</p>
                <p className="text-xs text-muted">Submitted {r.submitted}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
