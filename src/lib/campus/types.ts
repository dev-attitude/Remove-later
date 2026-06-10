export type CampusRole =
  | "vc"
  | "admin"
  | "registrar"
  | "lecturer"
  | "student"
  | "finance"
  | "hr"
  | "it";

export type CampusInstitutionType =
  | "university"
  | "college"
  | "vocational"
  | "nursing"
  | "teacher_training";

export type CampusModuleId =
  | "overview"
  | "student-home"
  | "registration"
  | "results"
  | "fees"
  | "timetable"
  | "executive"
  | "success"
  | "advisor"
  | "wallet"
  | "digital-id"
  | "attendance"
  | "exams"
  | "verify"
  | "employers"
  | "research"
  | "accreditation"
  | "crm"
  | "alumni"
  | "finance"
  | "assets"
  | "lms"
  | "chatbot";

export type CampusTenantView = {
  slug: string;
  name: string;
  tagline: string;
  institutionType: CampusInstitutionType;
  primaryColor: string;
  campuses: string[];
};

export type ExecutiveMetrics = {
  enrollment: number;
  retentionPct: number;
  graduationRatePct: number;
  tuitionRevenue: number;
  outstandingFees: number;
  collectionRatePct: number;
  passRatePct: number;
  staffCount: number;
  currency: string;
};

export type RiskStudent = {
  studentNumber: string;
  name: string;
  programme: string;
  failureRisk: number;
  dropoutRisk: number;
  feeDefaultRisk: number;
  graduationLikelihood: number;
};
