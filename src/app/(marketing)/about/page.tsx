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
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">About us</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">
            {COMPANY.name}
          </h1>
          <p className="mt-2 text-lg text-brand-300">{COMPANY.tagline}</p>
          <p className="mt-6 leading-relaxed text-slate-400">
            With offices in {COMPANY.offices.join(", ")}, and postal services via{" "}
            {COMPANY.poBox}, we serve businesses, institutions, and individuals who need
            reliable technology partners. Our team spans IT consulting, business strategy,
            hardware supply, and full-stack development—including the GM Research Suite academic
            platform used by students and supervisors.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            {COMPANY.businessHours.days}, {COMPANY.businessHours.time}.{" "}
            {COMPANY.businessHours.note}
          </p>
          <p className="mt-4 leading-relaxed text-slate-400">
            Whether you need a laptop for coursework, a turnaround plan for your SME, or a
            production web application, we bring the same professionalism and attention to detail.
          </p>
          <Link href="/contact" className="marketing-btn-primary mt-8 inline-flex">
            Work with us
          </Link>
        </div>
        <div className="flex justify-center">
          <div className="marketing-card-glow rounded-2xl border border-white/10 p-4">
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
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-6"
            >
              <Icon className="h-8 w-8 text-brand-400" />
              <h2 className="mt-4 text-lg font-semibold text-white">{v.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{v.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
