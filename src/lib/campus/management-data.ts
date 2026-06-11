/** Demo datasets for department management portals. Production replaces these with tenant data. */

// ─── Registrar ──────────────────────────────────────────────────────────────

export type Application = {
  id: string;
  applicant: string;
  programme: string;
  submitted: string;
  status: "pending" | "review" | "accepted" | "rejected";
};

export const ADMISSIONS_PIPELINE: Application[] = [
  { id: "APP-2026-0412", applicant: "T. Shikongo", programme: "BEd Foundation Phase", submitted: "2026-06-05", status: "review" },
  { id: "APP-2026-0413", applicant: "M. Nghidinwa", programme: "Diploma in Education", submitted: "2026-06-06", status: "pending" },
  { id: "APP-2026-0398", applicant: "K. Amutenya", programme: "BEd Foundation Phase", submitted: "2026-05-28", status: "accepted" },
  { id: "APP-2026-0371", applicant: "S. van Wyk", programme: "Diploma in Education", submitted: "2026-05-20", status: "accepted" },
  { id: "APP-2026-0355", applicant: "L. Haimbodi", programme: "BEd Foundation Phase", submitted: "2026-05-12", status: "rejected" },
];

export const REGISTRATION_STATS = {
  registered: 2614,
  pendingClearance: 142,
  unregistered: 84,
  deadline: "2026-07-15",
};

export const GRADUATION_QUEUE = [
  { student: "P. Nakanyala (AC2019112)", programme: "BEd Foundation Phase", credits: "400/400", status: "cleared" },
  { student: "J. Garoeb (AC2019087)", programme: "Diploma in Education", credits: "240/240", status: "fees hold" },
  { student: "E. Shilongo (AC2020034)", programme: "BEd Foundation Phase", credits: "384/400", status: "credits short" },
];

// ─── Finance ────────────────────────────────────────────────────────────────

export const FEE_STRUCTURES = [
  { programme: "BEd Foundation Phase", tuition: 37000, registration: 850, examFee: 600 },
  { programme: "Diploma in Education", tuition: 28500, registration: 850, examFee: 600 },
  { programme: "Short courses (per module)", tuition: 4200, registration: 350, examFee: 300 },
];

export const TOP_DEBTORS = [
  { student: "P. Tjihuiko (AC2021032)", balance: 12400, lastPayment: "2026-03-02", risk: 74 },
  { student: "M. Kapena (AC2021088)", balance: 8900, lastPayment: "2026-04-15", risk: 35 },
  { student: "J. Mbeki (AC2021045)", balance: 4200, lastPayment: "2026-05-20", risk: 20 },
];

export const RECENT_PAYMENTS = [
  { ref: "PAY-88123", student: "Demo Student (SC2026001)", method: "Mobile money", amount: 2000, date: "2026-06-09", reconciled: true },
  { ref: "PAY-88119", student: "N. Iyambo (AC2022071)", method: "Bank transfer", amount: 9250, date: "2026-06-09", reconciled: true },
  { ref: "PAY-88112", student: "F. Swartz (AC2023015)", method: "Card", amount: 4500, date: "2026-06-08", reconciled: false },
];

// ─── Lecturer ───────────────────────────────────────────────────────────────

export type LecturerClass = {
  code: string;
  title: string;
  students: number;
  nextSession: string;
  venue: string;
};

export const LECTURER_CLASSES: LecturerClass[] = [
  { code: "EDU301", title: "Curriculum Design", students: 124, nextSession: "Mon 08:00", venue: "Block A, Room 12" },
  { code: "EDU305", title: "Inclusive Education", students: 98, nextSession: "Tue 09:00", venue: "Block A, Room 8" },
];

export type ClassStudent = {
  studentNumber: string;
  name: string;
  attendancePct: number;
  currentMark: number | null;
};

export const CLASS_ROSTER: ClassStudent[] = [
  { studentNumber: "SC2026001", name: "Demo Student", attendancePct: 91, currentMark: 72 },
  { studentNumber: "AC2021045", name: "John Mbeki", attendancePct: 62, currentMark: 48 },
  { studentNumber: "AC2021088", name: "Mary Kapena", attendancePct: 71, currentMark: null },
  { studentNumber: "AC2021032", name: "Paul Tjihuiko", attendancePct: 78, currentMark: 58 },
  { studentNumber: "AC2022071", name: "Ndapanda Iyambo", attendancePct: 88, currentMark: 81 },
];

// ─── Examination office ─────────────────────────────────────────────────────

export const EXAM_SCHEDULE = [
  { module: "EDU301 Curriculum Design", date: "2026-06-22", venue: "Main Hall A", candidates: 124, invigilators: 4, status: "scheduled" },
  { module: "EDU305 Inclusive Education", date: "2026-06-25", venue: "Main Hall B", candidates: 98, invigilators: 3, status: "scheduled" },
  { module: "EDU210 Practicum I", date: "2026-06-18", venue: "Education Block", candidates: 86, invigilators: 3, status: "permits issued" },
];

export const MODERATION_QUEUE = [
  { module: "EDU101 Intro to Pedagogy", examiner: "Dr. N. Amadhila", moderator: "Prof. L. Shipena", status: "awaiting moderation" },
  { module: "ENG120 Academic English", examiner: "Ms. R. Beukes", moderator: "Dr. P. Kandjii", status: "moderated" },
  { module: "MAT115 Mathematics for Educators", examiner: "Mr. D. Gowaseb", moderator: "Dr. P. Kandjii", status: "changes requested" },
];

export const RESULT_PUBLICATION = [
  { term: "Semester 1, 2026", modules: 38, verified: 38, published: true, date: "2026-06-02" },
  { term: "Supplementary exams, S1 2026", modules: 12, verified: 7, published: false, date: "—" },
];

export const INTEGRITY_FLAGS = [
  { exam: "EDU101 (S1 2026)", flag: "Unusual mark distribution — venue B cluster", severity: "medium" },
  { exam: "MAT115 (S1 2026)", flag: "2 scripts with matching answer patterns", severity: "high" },
];

// ─── Institution admin ──────────────────────────────────────────────────────

export const ACADEMIC_YEAR = {
  current: "2026",
  semesters: [
    { name: "Semester 1", start: "2026-02-03", end: "2026-06-30", status: "active" },
    { name: "Semester 2", start: "2026-07-21", end: "2026-11-28", status: "upcoming" },
  ],
};

export const INSTITUTION_USERS = [
  { name: "SmartCampus Demo VC", email: "campus@gmconsultations.com", role: "Institution Admin", status: "active" },
  { name: "Demo Registrar", email: "registrar@smartcampus.demo", role: "Registrar", status: "active" },
  { name: "Demo Finance Officer", email: "finance@smartcampus.demo", role: "Finance", status: "active" },
  { name: "Demo Lecturer", email: "lecturer@smartcampus.demo", role: "Lecturer", status: "active" },
  { name: "Demo Exams Officer", email: "exams@smartcampus.demo", role: "Examinations", status: "active" },
  { name: "Demo Student", email: "student@smartcampus.demo", role: "Student", status: "active" },
];

export const GLOBAL_ANNOUNCEMENTS = [
  { title: "Semester 2 registration opens 1 July", audience: "All students", sent: "2026-06-09" },
  { title: "Staff performance reviews due", audience: "All staff", sent: "2026-06-04" },
];

// ─── Super admin (platform) ─────────────────────────────────────────────────

export const PLATFORM_BILLING = [
  { tenant: "Horizon University", plan: "Enterprise", students: 32500, mrr: 48750, status: "active", renewal: "2027-01-01" },
  { tenant: "Acacia College", plan: "Professional", students: 2840, mrr: 8520, status: "active", renewal: "2026-09-01" },
  { tenant: "Unity Nursing Institute", plan: "Starter", students: 920, mrr: 2760, status: "trial", renewal: "2026-07-10" },
];

export const SYSTEM_STATUS = [
  { service: "Application servers", status: "operational", detail: "3/3 healthy" },
  { service: "PostgreSQL (primary)", status: "operational", detail: "12ms avg query" },
  { service: "AI services (OpenAI)", status: "operational", detail: "Normal latency" },
  { service: "Payment gateway", status: "degraded", detail: "Card processor slow — monitoring" },
  { service: "Last database backup", status: "operational", detail: "2026-06-10 03:00 UTC" },
];

export const AUDIT_LOG = [
  { at: "2026-06-10 11:42", actor: "campus@gmconsultations.com", action: "Published S1 results — Acacia College" },
  { at: "2026-06-10 09:15", actor: "registrar@smartcampus.demo", action: "Accepted application APP-2026-0398" },
  { at: "2026-06-09 16:30", actor: "system", action: "Nightly backup completed (3 tenants)" },
  { at: "2026-06-09 14:02", actor: "finance@smartcampus.demo", action: "Reconciled 18 payments — N$ 142,300" },
];
