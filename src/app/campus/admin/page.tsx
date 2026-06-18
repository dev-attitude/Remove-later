import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  Building2,
  CreditCard,
  Database,
  ScrollText,
  Server,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SMARTCAMPUS } from "@/lib/campus/brand";
import { formatCampusCurrency } from "@/lib/campus/data";
import {
  AUDIT_LOG,
  PLATFORM_BILLING,
  SYSTEM_STATUS,
} from "@/lib/campus/management-data";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  operational: "bg-emerald-100 text-emerald-800",
  degraded: "bg-amber-100 text-amber-800",
  down: "bg-rose-100 text-rose-800",
  active: "bg-emerald-100 text-emerald-800",
  trial: "bg-blue-100 text-blue-800",
  suspended: "bg-rose-100 text-rose-800",
};

export default async function SuperAdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/campus/login?callbackUrl=/campus/admin");
  if (role !== "admin") redirect("/campus/login");

  const tenants = await prisma.campusTenant.findMany({
    include: { _count: { select: { students: true, memberships: true } } },
    orderBy: { name: "asc" },
  });

  const totalMrr = PLATFORM_BILLING.reduce((s, b) => s + b.mrr, 0);

  return (
    <div className="min-h-screen bg-charcoal text-offwhite">
      <header className="border-b border-charcoal bg-charcoal">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {SMARTCAMPUS.productName} — Super Administrator
            </p>
            <h1 className="text-lg font-semibold">Platform Control Centre</h1>
          </div>
          <Link
            href="/campus"
            className="rounded-lg border border-charcoal px-3 py-1.5 text-xs font-medium text-muted hover:bg-charcoal"
          >
            Product site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <section>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-charcoal bg-charcoal p-5">
              <p className="text-xs text-muted">Institutions</p>
              <p className="mt-1 text-3xl font-bold">{tenants.length}</p>
            </div>
            <div className="rounded-xl border border-charcoal bg-charcoal p-5">
              <p className="text-xs text-muted">Monthly recurring revenue</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">
                {formatCampusCurrency(totalMrr)}
              </p>
            </div>
            <div className="rounded-xl border border-charcoal bg-charcoal p-5">
              <p className="text-xs text-muted">Total students hosted</p>
              <p className="mt-1 text-3xl font-bold">
                {PLATFORM_BILLING.reduce((s, b) => s + b.students, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-blue-400" /> Institutions
          </h2>
          <div className="overflow-x-auto rounded-xl border border-charcoal bg-charcoal">
            <table className="min-w-full text-sm">
              <thead className="border-b border-charcoal text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Students (DB)</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Portal</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-charcoal/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-muted">{t.slug}</td>
                    <td className="px-4 py-3">{t._count.students}</td>
                    <td className="px-4 py-3">{t._count.memberships}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/campus/${t.slug}`}
                        className="text-blue-400 hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-offwhite"
          >
            + Onboard new institution (demo)
          </button>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5 text-blue-400" /> Subscription billing & licenses
          </h2>
          <div className="overflow-x-auto rounded-xl border border-charcoal bg-charcoal">
            <table className="min-w-full text-sm">
              <thead className="border-b border-charcoal text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Licensed students</th>
                  <th className="px-4 py-3">MRR</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Renewal</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_BILLING.map((b) => (
                  <tr key={b.tenant} className="border-b border-charcoal/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{b.tenant}</td>
                    <td className="px-4 py-3">{b.plan}</td>
                    <td className="px-4 py-3">{b.students.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400">{formatCampusCurrency(b.mrr)}/mo</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{b.renewal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Server className="h-5 w-5 text-blue-400" /> System monitoring
            </h2>
            <div className="space-y-2">
              {SYSTEM_STATUS.map((s) => (
                <div
                  key={s.service}
                  className="flex items-center justify-between gap-3 rounded-xl border border-charcoal bg-charcoal p-4"
                >
                  <div className="flex items-center gap-3">
                    {s.service.includes("backup") || s.service.includes("PostgreSQL") ? (
                      <Database className="h-4 w-4 text-muted" />
                    ) : (
                      <Activity className="h-4 w-4 text-muted" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{s.service}</p>
                      <p className="text-xs text-muted">{s.detail}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.status]}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <ScrollText className="h-5 w-5 text-blue-400" /> Audit log
            </h2>
            <div className="space-y-2">
              {AUDIT_LOG.map((e) => (
                <div key={e.at + e.action} className="rounded-xl border border-charcoal bg-charcoal p-4">
                  <p className="text-sm">{e.action}</p>
                  <p className="mt-1 text-xs text-muted">
                    {e.at} · {e.actor}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
