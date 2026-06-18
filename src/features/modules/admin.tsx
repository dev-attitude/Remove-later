import { Settings } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { USER_ROLES } from "@/lib/modules";

const STATS = [
  { label: "Active users", value: "2,847" },
  { label: "AI tokens (30d)", value: "14.2M" },
  { label: "Institutions", value: "38" },
  { label: "Revenue (MTD)", value: "$48,200" },
];

export default function AdminPage() {
  return (
    <>
      <ModuleHeader
        title="Admin Panel"
        description="User & institution management, subscriptions, AI analytics, payments, and role permissions."
        icon={Settings}
      />
      <ModuleWorkspace>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <Card key={s.label} className="!p-4">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="text-2xl font-bold text-charcoal">{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>User roles</CardTitle>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {USER_ROLES.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>Admin actions</CardTitle>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>User management & SSO</li>
              <li>Institution onboarding</li>
              <li>Subscription & plan limits</li>
              <li>AI usage analytics & quotas</li>
              <li>Payment & invoicing</li>
              <li>Export compliance reports</li>
            </ul>
          </Card>
        </div>
      </ModuleWorkspace>
    </>
  );
}
