import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type StudentRecord = {
  name: string;
  studentNumber: string;
  programme: string;
  enrollmentYear: number;
  attendancePct: number;
  averageMark: number;
  feesOutstanding: number;
  graduationLikelihood: number;
};

const FALLBACK_STUDENT: StudentRecord = {
  name: "Demo Student",
  studentNumber: "SC2026001",
  programme: "BEd Foundation Phase",
  enrollmentYear: 2024,
  attendancePct: 91,
  averageMark: 68,
  feesOutstanding: 3500,
  graduationLikelihood: 86,
};

/** Resolve the logged-in user's student record for this tenant (falls back to demo data). */
export async function getStudentRecord(slug: string): Promise<StudentRecord> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return FALLBACK_STUDENT;

  const tenant = await prisma.campusTenant.findUnique({ where: { slug } });
  if (!tenant) return FALLBACK_STUDENT;

  const row = await prisma.campusStudent.findFirst({
    where: { tenantId: tenant.id, email },
  });
  if (!row) return FALLBACK_STUDENT;

  const programme = row.programmeCode
    ? await prisma.campusProgramme.findUnique({
        where: { tenantId_code: { tenantId: tenant.id, code: row.programmeCode } },
      })
    : null;

  return {
    name: row.name,
    studentNumber: row.studentNumber,
    programme: programme?.name ?? row.programmeCode ?? "—",
    enrollmentYear: row.enrollmentYear ?? 2024,
    attendancePct: Math.round(row.attendancePct ?? 0),
    averageMark: Math.round(row.averageMark ?? 0),
    feesOutstanding: row.feesOutstanding,
    graduationLikelihood: Math.round(row.graduationLikelihood ?? 0),
  };
}

export type ModuleResult = {
  code: string;
  title: string;
  credits: number;
  mark: number;
  grade: string;
  status: "pass" | "fail" | "distinction";
};

export const STUDENT_RESULTS: { semester: string; gpa: number; modules: ModuleResult[] }[] = [
  {
    semester: "Semester 1, 2026",
    gpa: 3.1,
    modules: [
      { code: "EDU201", title: "Literacy Methods", credits: 16, mark: 72, grade: "B", status: "pass" },
      { code: "EDU205", title: "Classroom Management", credits: 16, mark: 81, grade: "A", status: "distinction" },
      { code: "EDU210", title: "Practicum I", credits: 24, mark: 65, grade: "C+", status: "pass" },
      { code: "PSY110", title: "Child Development", credits: 12, mark: 58, grade: "C", status: "pass" },
    ],
  },
  {
    semester: "Semester 2, 2025",
    gpa: 2.8,
    modules: [
      { code: "EDU101", title: "Introduction to Pedagogy", credits: 16, mark: 68, grade: "B-", status: "pass" },
      { code: "ENG120", title: "Academic English", credits: 12, mark: 74, grade: "B", status: "pass" },
      { code: "MAT115", title: "Mathematics for Educators", credits: 16, mark: 49, grade: "F", status: "fail" },
      { code: "ICT100", title: "Digital Literacy", credits: 8, mark: 88, grade: "A", status: "distinction" },
    ],
  },
];

export type RegistrableModule = {
  code: string;
  title: string;
  credits: number;
  semester: string;
  prerequisiteMet: boolean;
};

export const REGISTERED_MODULES: RegistrableModule[] = [
  { code: "EDU301", title: "Curriculum Design", credits: 16, semester: "S2 2026", prerequisiteMet: true },
  { code: "EDU310", title: "Practicum II", credits: 24, semester: "S2 2026", prerequisiteMet: true },
];

export const AVAILABLE_MODULES: RegistrableModule[] = [
  { code: "EDU305", title: "Inclusive Education", credits: 16, semester: "S2 2026", prerequisiteMet: true },
  { code: "EDU320", title: "Assessment & Evaluation", credits: 16, semester: "S2 2026", prerequisiteMet: true },
  { code: "MAT215", title: "Mathematics Education II", credits: 16, semester: "S2 2026", prerequisiteMet: false },
  { code: "RES200", title: "Introduction to Research", credits: 12, semester: "S2 2026", prerequisiteMet: true },
];

export type FeeEntry = {
  date: string;
  description: string;
  debit?: number;
  credit?: number;
};

export const FEE_STATEMENT: FeeEntry[] = [
  { date: "2026-01-15", description: "Tuition — Semester 1, 2026", debit: 18500 },
  { date: "2026-01-15", description: "Registration fee", debit: 850 },
  { date: "2026-01-20", description: "Payment — bank transfer", credit: 10000 },
  { date: "2026-02-28", description: "Payment — mobile money", credit: 4000 },
  { date: "2026-03-10", description: "Library fine", debit: 150 },
  { date: "2026-04-05", description: "Payment — bank transfer", credit: 2000 },
];

export type TimetableEntry = {
  day: string;
  time: string;
  module: string;
  venue: string;
  lecturer: string;
};

export const STUDENT_TIMETABLE: TimetableEntry[] = [
  { day: "Monday", time: "08:00–10:00", module: "EDU301 Curriculum Design", venue: "Block A, Room 12", lecturer: "Dr. N. Amadhila" },
  { day: "Monday", time: "11:00–13:00", module: "EDU310 Practicum II (Seminar)", venue: "Block C, Room 4", lecturer: "Ms. T. Haufiku" },
  { day: "Tuesday", time: "09:00–11:00", module: "EDU305 Inclusive Education", venue: "Block A, Room 8", lecturer: "Prof. L. Shipena" },
  { day: "Wednesday", time: "08:00–12:00", module: "EDU310 Practicum II (School placement)", venue: "Partner school", lecturer: "Mentor teacher" },
  { day: "Thursday", time: "10:00–12:00", module: "EDU320 Assessment & Evaluation", venue: "Block B, Room 2", lecturer: "Dr. N. Amadhila" },
  { day: "Friday", time: "08:00–09:00", module: "Academic advising (optional)", venue: "Student Success Centre", lecturer: "Advisor on duty" },
];
