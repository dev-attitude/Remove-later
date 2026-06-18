"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import { GROWTH_TOOLS, type GrowthToolId } from "@/lib/hosting-account-types";
import { AccountEmptyState, AccountPageHeader } from "@/components/hosting/account/AccountShared";

export function GrowthToolsPage() {
  const { account, loaded, recordGrowthToolUse } = useHostingAccount();
  const [activeTool, setActiveTool] = useState<(typeof GROWTH_TOOLS)[number] | null>(null);

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  function launch(toolId: GrowthToolId, tool: (typeof GROWTH_TOOLS)[number]) {
    recordGrowthToolUse(toolId);
    setActiveTool(tool);
  }

  return (
    <div>
      <AccountPageHeader
        title="Growth Tools"
        description="Marketing and branding tools included with your hosting account"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {GROWTH_TOOLS.map((tool) => {
          const used = account.growthToolsUsed.includes(tool.id);
          return (
            <article
              key={tool.id}
              className="rounded-xl border border-line bg-offwhite p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Sparkles className="h-6 w-6 text-royal" />
                {used && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Used
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-bold text-navy">{tool.name}</h2>
              <p className="mt-1 text-sm text-muted">{tool.desc}</p>
              <button
                type="button"
                onClick={() => launch(tool.id, tool)}
                className="mt-4 text-sm font-semibold text-royal hover:underline"
              >
                Launch tool
              </button>
            </article>
          );
        })}
      </div>

      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-offwhite p-6 shadow-xl">
            <h2 className="text-lg font-bold text-navy">{activeTool.name}</h2>
            <p className="mt-2 text-sm text-muted">
              The {activeTool.name} workspace opens here once fully integrated. Your session has been
              recorded — our team can help you finish your {activeTool.name.toLowerCase()} project on
              request.
            </p>
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              className="marketing-btn-primary mt-6 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
