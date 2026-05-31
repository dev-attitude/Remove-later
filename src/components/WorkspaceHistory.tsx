"use client";

import { History, Trash2, Plus } from "lucide-react";
import { formatWorkspaceDate, type WorkspaceItem } from "@/lib/client/workspace-storage";
import { Button } from "@/components/ui/Button";

export function WorkspaceHistory({
  items,
  activeId,
  onSelect,
  onDelete,
  onNew,
  label = "Your saved work",
}: {
  items: WorkspaceItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  label?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="mb-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
        <History className="mb-1 inline h-4 w-4 text-slate-400" /> {label} — saved
        automatically on this device when you generate or edit.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <History className="h-4 w-4 text-brand-600" />
          {label} ({items.length})
        </p>
        <Button type="button" variant="secondary" className="!py-1 !text-xs" onClick={onNew}>
          <Plus className="h-3 w-3" />
          New
        </Button>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Stored on this browser — returns when you leave and come back.
      </p>
      <ul className="max-h-48 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id}>
            <div
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                activeId === item.id
                  ? "bg-brand-50 ring-1 ring-brand-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => onSelect(item.id)}
              >
                <span className="block truncate font-medium text-slate-800">
                  {item.title}
                </span>
                <span className="text-xs text-slate-500">
                  {formatWorkspaceDate(item.updatedAt)}
                  {item.result ? " · has results" : " · draft"}
                </span>
              </button>
              <button
                type="button"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Delete"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
