import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3,
  Bot,
  Building2,
  GraduationCap,
  QrCode,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { SMARTCAMPUS, CAMPUS_ARCHITECTURE } from "@/lib/campus/brand";
import { DEMO_TENANTS } from "@/lib/campus/data";
import { institutionTypeLabel } from "@/lib/campus/data";

export const metadata: Metadata = {
  title: `${SMARTCAMPUS.productName} | Next-Generation University ERP`,
  description:
    "AI-powered multi-institution ERP: student success analytics, finance, LMS, CRM, research, and digital verification for Southern African universities.",
};

const DIFFERENTIATORS = [
  { icon: GraduationCap, title: "Student Risk Prediction AI", desc: "Act before failure, dropout, or fee default." },
  { icon: QrCode, title: "Blockchain Certificate Verify", desc: "Employers verify qualifications instantly." },
  { icon: Building2, title: "Digital Student Wallet", desc: "Tuition, hostel, cafeteria, and printing credits." },
  { icon: Users, title: "Institutional CRM", desc: "Prospects, sponsors, alumni, and industry partners." },
  { icon: BarChart3, title: "Executive Command Centre", desc: "Real-time enrollment, revenue, and pass rates." },
  { icon: ShieldCheck, title: "Accreditation & QA", desc: "NQA requirements and programme audits." },
  { icon: Bot, title: "AI Academic Advisor", desc: "Module recommendations and graduation pathways." },
  { icon: Smartphone, title: "Mobile Super App", desc: "One app for students, lecturers, and management." },
];

export default function CampusMarketingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="max-w-3xl">
        <p className="marketing-eyebrow">White-label SaaS for institutions</p>
        <h1 className="marketing-page-title">{SMARTCAMPUS.productName}</h1>
        <p className="mt-2 text-lg font-medium text-blue-700">{SMARTCAMPUS.tagline}</p>
        <p className="mt-4 marketing-lead">{SMARTCAMPUS.pitch}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/campus/login" className="marketing-btn-primary text-sm">
            Sign in to management demo
          </Link>
          <Link
            href="/campus/login?callbackUrl=/campus/acacia-college/student"
            className="marketing-btn-secondary text-sm"
          >
            Try the student portal
          </Link>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-xl font-bold text-slate-900">Platform architecture</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CAMPUS_ARCHITECTURE.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-bold text-slate-900">What makes it sell</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5">
              <Icon className="h-8 w-8 text-blue-600" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-bold text-slate-900">Multi-tenant demos</h2>
        <p className="mt-2 text-sm text-slate-600">
          One platform — universities, colleges, nursing schools, and vocational centres. Each with
          own branding, users, and reports.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {DEMO_TENANTS.map((t) => (
            <Link
              key={t.slug}
              href={`/campus/${t.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              style={{ borderTopWidth: 4, borderTopColor: t.primaryColor }}
            >
              <p className="text-xs font-medium uppercase text-slate-500">
                {institutionTypeLabel(t.institutionType)}
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-blue-700">
                {t.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{t.tagline}</p>
              <p className="mt-4 text-sm font-medium text-blue-600">Enter portal →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="marketing-info-banner mt-16 max-w-3xl">
        <p className="font-semibold">Subscription SaaS for Southern Africa</p>
        <p className="mt-1 text-sm opacity-90">
          Market to universities, colleges, and training centres across Namibia and the region.
          Recurring monthly revenue — not one-time software sales. Built by Skyrapay Consultations CC.
        </p>
        <Link href="/contact" className="marketing-btn-primary mt-4 inline-block text-sm">
          Request a demo
        </Link>
      </section>
    </div>
  );
}
