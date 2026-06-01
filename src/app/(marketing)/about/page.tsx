import Link from "next/link";
import Image from "next/image";
import { Target, Users, Zap } from "lucide-react";
import { COMPANY } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | GM Consultations",
  description: "Learn about GM Consultations — expert solutions for success.",
};

const VALUES = [
  {
    icon: Target,
    title: "Results-focused",
    text: "Every engagement is measured against clear outcomes—not buzzwords.",
  },
  {
    icon: Users,
    title: "Partnership",
    text: "We work alongside your team, transferring knowledge as we deliver.",
  },
  {
    icon: Zap,
    title: "Modern technology",
    text: "From cloud infrastructure to AI-powered research tools—we stay current.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="marketing-eyebrow">About us</p>
          <h1 className="marketing-page-title">{COMPANY.name}</h1>
          <p className="mt-2 text-lg font-medium text-brand-600">{COMPANY.tagline}</p>
          <p className="mt-6 leading-relaxed text-slate-600">
            With offices in {COMPANY.offices.join(", ")}, and postal services via{" "}
            {COMPANY.poBox}, we serve businesses, institutions, and individuals who need
            reliable technology partners. Our team spans IT consulting, business strategy,
            hardware supply, and full-stack development—including the GM Research Suite academic
            platform used by students and supervisors.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Whether you need a laptop for coursework, a turnaround plan for your SME, or a
            production web application, we bring the same professionalism and attention to detail.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            {COMPANY.businessHours.days}, {COMPANY.businessHours.time}.{" "}
            {COMPANY.businessHours.note}
          </p>
          <Link href="/contact" className="marketing-btn-primary mt-8 inline-flex">
            Work with us
          </Link>
        </div>
        <div className="flex justify-center">
          <div className="marketing-card-glow rounded-2xl bg-white p-4">
            <Image
              src="/logo.png"
              alt={COMPANY.name}
              width={360}
              height={360}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div
              key={v.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Icon className="h-8 w-8 text-brand-600" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{v.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{v.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
