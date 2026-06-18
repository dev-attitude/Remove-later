import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";

const FLOW = [
  {
    step: 1,
    title: "Sign in & choose role",
    body: "Students, supervisors, and admins get different dashboards. Institution plans unlock repository and department analytics.",
  },
  {
    step: 2,
    title: "Upload or describe research",
    body: "PDFs go to the Understanding pipeline (chunk → embed → vector store). Datasets go to Data Analysis. Audio to Transcription.",
  },
  {
    step: 3,
    title: "AI orchestration layer",
    body: "Your prompt is routed to the right model: GPT for writing, fine-tuned academic models for tone, RAG for grounded answers from your files.",
  },
  {
    step: 4,
    title: "Generate & refine",
    body: "Writing, literature, proposals, and presentations produce drafts. Smart tools rewrite, humanize, and add citations.",
  },
  {
    step: 5,
    title: "Integrity checks",
    body: "Run AI detection and plagiarism before submission. Citation module verifies DOIs and builds bibliographies.",
  },
  {
    step: 6,
    title: "Collaborate & submit",
    body: "Supervisors comment, approve versions, and track progress. Repository stores final theses with DOI.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <ModuleHeader
        title="How Skyrapay Research Suite Works"
        description="End-to-end architecture: from upload to publication-ready output with integrity and collaboration."
        icon={HelpCircle}
      />
      <ModuleWorkspace>
        <Card className="mb-8 border-brand-200 bg-brand-50/30">
          <CardTitle>Quick start</CardTitle>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-charcoal">
            <li>
              Install: <code className="rounded bg-offwhite px-1">cd gm-research-suite && npm install && npm run dev</code>
            </li>
            <li>Open the <Link href="/research" className="text-brand-600 underline">portal hub</Link> — choose Institution, Student, Analysis, or Developer.</li>
            <li>
              Demo mode uses <strong>mock AI</strong> in <code className="rounded bg-offwhite px-1">src/lib/mock-ai.ts</code>.
              Replace with OpenAI, Anthropic, or your backend API.
            </li>
          </ol>
        </Card>

        <h2 className="mb-4 font-display text-xl font-bold">User journey</h2>
        <div className="space-y-4">
          {FLOW.map((f) => (
            <Card key={f.step} className="flex gap-4 !p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-offwhite">
                {f.step}
              </div>
              <div>
                <p className="font-semibold text-charcoal">{f.title}</p>
                <p className="mt-1 text-sm text-muted">{f.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <h2 className="mb-4 mt-10 font-display text-xl font-bold">System architecture</h2>
        <Card>
          <pre className="overflow-x-auto text-xs leading-relaxed text-charcoal">{`
┌─────────────────────────────────────────────────────────────────┐
│                  Skyrapay Research Suite (Web)                   │
│  Next.js UI · Dashboard · 18 modules · Role-based views          │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST / GraphQL
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway / BFF                           │
│  Auth (JWT) · Rate limits · Plan quotas · Audit logs             │
└─┬──────────┬──────────┬──────────┬──────────┬──────────┬────────┘
  │          │          │          │          │          │
  ▼          ▼          ▼          ▼          ▼          ▼
Writing   RAG/      Literature  Stats      Integrity  Collab
Service   Vector    Search      Engine     Services   + Repo
          DB        APIs        (R/Python) (AI+Plag)
          │
          ▼
    ┌─────────────┐     ┌──────────────┐
    │  PostgreSQL │     │  S3 / Blob   │
    │  users, meta  │     │  PDFs, media │
    └─────────────┘     └──────────────┘
`}</pre>
        </Card>

        <h2 className="mb-4 mt-10 font-display text-xl font-bold">Module → technology map</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-4">Module</th>
                <th className="py-2">How it works (production)</th>
              </tr>
            </thead>
            <tbody className="text-charcoal">
              {[
                ["Writing", "LLM + RAG over user docs; citation plugin (CrossRef)"],
                ["Understanding", "PDF parse → chunk → embeddings → Q&A / quiz gen"],
                ["Literature", "Scholar/Semantic Scholar APIs → theme clustering → gap analysis"],
                ["Data analysis", "Pandas/R worker; auto test selection; chart export"],
                ["Transcription", "Whisper ASR; diarization; NLP theme extraction"],
                ["AI detection", "Classifier ensemble; sentence-level scores"],
                ["Plagiarism", "Web + institutional index; fingerprint matching"],
                ["Citations", "CSL styles; DOI Content Negotiation"],
                ["Collaboration", "WebSocket chat; CRDT or versioned docs"],
                ["Mobile", "React Native; offline SQLite; same API"],
              ].map(([mod, tech]) => (
                <tr key={mod} className="border-b border-line">
                  <td className="py-2 pr-4 font-medium">{mod}</td>
                  <td className="py-2">{tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/student/writing"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-offwhite hover:bg-brand-700"
          >
            Try writing (Student portal) <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-cream-50"
          >
            Back to portals
          </Link>
        </div>
      </ModuleWorkspace>
    </>
  );
}
