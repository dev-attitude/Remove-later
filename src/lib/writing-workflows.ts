/** Assignment & research writing service checklists — Business Manager */

import type { RegistrationStep, RegistrationWorkflow } from "@/lib/registration-workflows";

const ASSIGNMENT_UNDERGRAD_STEPS: RegistrationStep[] = [
  { stepKey: "brief_rubric", title: "Brief, rubric & deadline received from client" },
  { stepKey: "topic_research", title: "Topic research & source search" },
  { stepKey: "outline", title: "Outline approved with client" },
  { stepKey: "first_draft", title: "First draft written" },
  { stepKey: "format_citations", title: "Editing, formatting & citations (APA / Harvard)" },
  { stepKey: "revision", title: "Client revision round" },
  { stepKey: "final_delivery", title: "Final delivery to client" },
];

const ASSIGNMENT_POSTGRAD_STEPS: RegistrationStep[] = [
  { stepKey: "brief_rubric", title: "Brief, rubric & deadline confirmed" },
  { stepKey: "literature_search", title: "Literature search & source collection" },
  { stepKey: "outline", title: "Outline & argument structure approved" },
  { stepKey: "first_draft", title: "First draft with critical analysis" },
  { stepKey: "format_citations", title: "Formatting, citations & proofreading" },
  { stepKey: "revision", title: "Revision from client feedback" },
  { stepKey: "final_delivery", title: "Final delivery to client" },
];

const PROPOSAL_UNDERGRAD_STEPS: RegistrationStep[] = [
  { stepKey: "brief", title: "Brief & supervisor requirements confirmed" },
  { stepKey: "literature_search", title: "Literature search & research gap mapping" },
  { stepKey: "introduction", title: "Introduction & problem statement draft" },
  { stepKey: "literature_review", title: "Literature review section" },
  { stepKey: "methodology", title: "Methodology draft" },
  { stepKey: "timeline_refs", title: "Timeline, references & ethics checklist" },
  { stepKey: "supervisor_review", title: "Client / supervisor review" },
  { stepKey: "final_proposal", title: "Final ethics-ready proposal delivered" },
];

const PROPOSAL_POSTGRAD_STEPS: RegistrationStep[] = [
  { stepKey: "brief", title: "Brief & supervisor requirements confirmed" },
  { stepKey: "literature_search", title: "Comprehensive literature search & gap analysis" },
  { stepKey: "theoretical_framework", title: "Theoretical framework draft" },
  { stepKey: "literature_review", title: "Full literature review section" },
  { stepKey: "methodology", title: "Detailed methodology & ethics section" },
  { stepKey: "supervisor_review", title: "Client / supervisor review" },
  { stepKey: "final_proposal", title: "Final ethics submission package delivered" },
];

const PHD_MONTHLY_STEPS: RegistrationStep[] = [
  { stepKey: "monthly_checkin", title: "Monthly check-in & milestone agreed" },
  { stepKey: "literature_search", title: "Literature search & source collection" },
  { stepKey: "draft_section", title: "Draft chapter / section for the month" },
  { stepKey: "supervisor_feedback", title: "Supervisor feedback received" },
  { stepKey: "revisions", title: "Revisions completed" },
  { stepKey: "month_close", title: "Month closed — next milestone set" },
];

const THESIS_UNDERGRAD_STEPS: RegistrationStep[] = [
  { stepKey: "brief_plan", title: "Brief & chapter plan confirmed" },
  { stepKey: "literature_search", title: "Literature search & source collection" },
  { stepKey: "ch1_intro", title: "Chapter 1 — Introduction" },
  { stepKey: "ch2_literature", title: "Chapter 2 — Literature review" },
  { stepKey: "ch3_methodology", title: "Chapter 3 — Methodology" },
  { stepKey: "ch4_results", title: "Chapter 4 — Results / findings" },
  { stepKey: "ch5_discussion", title: "Chapter 5 — Discussion" },
  { stepKey: "ch6_conclusion", title: "Chapter 6 — Conclusion & recommendations" },
  { stepKey: "formatting", title: "Formatting, citations & reference list" },
  { stepKey: "supervisor_revision", title: "Supervisor revision rounds" },
  { stepKey: "final_submission", title: "Final submission to client" },
];

const THESIS_POSTGRAD_STEPS: RegistrationStep[] = [
  { stepKey: "brief_plan", title: "Brief & chapter plan confirmed" },
  { stepKey: "literature_search", title: "Literature search & gap synthesis" },
  { stepKey: "theoretical_framework", title: "Theoretical framework integrated" },
  { stepKey: "ch1_intro", title: "Chapter 1 — Introduction" },
  { stepKey: "ch2_literature", title: "Chapter 2 — Literature review" },
  { stepKey: "ch3_methodology", title: "Chapter 3 — Methodology" },
  { stepKey: "ch4_results", title: "Chapter 4 — Results / findings" },
  { stepKey: "ch5_discussion", title: "Chapter 5 — Discussion" },
  { stepKey: "ch6_conclusion", title: "Chapter 6 — Conclusion & recommendations" },
  { stepKey: "formatting", title: "Formatting, citations & reference list" },
  { stepKey: "supervisor_revision", title: "Supervisor revision rounds" },
  { stepKey: "final_submission", title: "Final submission to client" },
];

const THESIS_MASTERS_STEPS: RegistrationStep[] = [
  { stepKey: "brief_plan", title: "Brief & dissertation plan confirmed" },
  { stepKey: "literature_search", title: "Extensive literature search & synthesis" },
  { stepKey: "theoretical_framework", title: "Theoretical & conceptual framework" },
  { stepKey: "ch1_intro", title: "Chapter 1 — Introduction" },
  { stepKey: "ch2_literature", title: "Chapter 2 — Literature review" },
  { stepKey: "ch3_methodology", title: "Chapter 3 — Methodology" },
  { stepKey: "ch4_results", title: "Chapter 4 — Results / findings" },
  { stepKey: "ch5_discussion", title: "Chapter 5 — Discussion" },
  { stepKey: "ch6_conclusion", title: "Chapter 6 — Conclusion & recommendations" },
  { stepKey: "data_integration", title: "Data integration & analysis (if applicable)" },
  { stepKey: "formatting", title: "Submission-ready formatting & references" },
  { stepKey: "supervisor_revision", title: "Supervisor revision rounds" },
  { stepKey: "final_submission", title: "Final submission to client" },
];

const DATA_QUAL_STEPS: RegistrationStep[] = [
  { stepKey: "design", title: "Research design & instrument planning" },
  { stepKey: "guides", title: "Interview / focus group guide design" },
  { stepKey: "pilot", title: "Pilot testing" },
  { stepKey: "recruitment", title: "Recruitment & scheduling" },
  { stepKey: "fieldwork", title: "Fieldwork / data collection" },
  { stepKey: "transcription", title: "Transcription & organisation" },
  { stepKey: "handover", title: "Dataset handover to client" },
];

const DATA_QUANT_STEPS: RegistrationStep[] = [
  { stepKey: "design", title: "Survey / questionnaire design" },
  { stepKey: "sampling", title: "Sampling plan & deployment setup" },
  { stepKey: "collection", title: "Data collection monitoring" },
  { stepKey: "entry_clean", title: "Data entry & cleaning" },
  { stepKey: "transcript", title: "Transcript preparation" },
  { stepKey: "handover", title: "Clean dataset handover to client" },
];

export const WRITING_WORKFLOWS: RegistrationWorkflow[] = [
  {
    packageId: "assignment-undergrad",
    label: "Undergraduate Assignment",
    steps: ASSIGNMENT_UNDERGRAD_STEPS,
  },
  {
    packageId: "assignment-postgrad",
    label: "Postgraduate Assignment",
    steps: ASSIGNMENT_POSTGRAD_STEPS,
  },
  {
    packageId: "research-proposal-undergrad",
    label: "Research Proposal — Undergraduate",
    steps: PROPOSAL_UNDERGRAD_STEPS,
  },
  {
    packageId: "research-proposal-postgrad",
    label: "Research Proposal — Postgraduate",
    steps: PROPOSAL_POSTGRAD_STEPS,
  },
  {
    packageId: "research-phd-monthly",
    label: "PhD Research Assistance (monthly)",
    steps: PHD_MONTHLY_STEPS,
  },
  {
    packageId: "research-thesis-undergrad",
    label: "Thesis — Undergraduate",
    steps: THESIS_UNDERGRAD_STEPS,
  },
  {
    packageId: "research-thesis-postgrad",
    label: "Thesis — Postgraduate",
    steps: THESIS_POSTGRAD_STEPS,
  },
  {
    packageId: "research-thesis-masters",
    label: "Thesis — Masters Level",
    steps: THESIS_MASTERS_STEPS,
  },
  {
    packageId: "data-collection-qualitative",
    label: "Data Collection — Qualitative",
    steps: DATA_QUAL_STEPS,
  },
  {
    packageId: "data-collection-quantitative",
    label: "Data Collection — Quantitative",
    steps: DATA_QUANT_STEPS,
  },
];

export function getWritingWorkflow(packageId: string | null | undefined): RegistrationWorkflow | null {
  if (!packageId) return null;
  return WRITING_WORKFLOWS.find((w) => w.packageId === packageId) ?? null;
}

export function isWritingPackage(packageId: string | null | undefined): boolean {
  return Boolean(getWritingWorkflow(packageId));
}
