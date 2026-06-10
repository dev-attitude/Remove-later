/** Demo datasets for the student super-app portal. Production replaces these with tenant data. */

// ─── My Modules ─────────────────────────────────────────────────────────────

export type StudentModule = {
  code: string;
  title: string;
  lecturer: string;
  lecturerEmail: string;
  credits: number;
  outline: string;
  materials: { name: string; type: "pdf" | "video" | "slides" }[];
  nextDeadline?: { title: string; due: string };
};

export const MY_MODULES: StudentModule[] = [
  {
    code: "EDU301",
    title: "Curriculum Design",
    lecturer: "Dr. N. Amadhila",
    lecturerEmail: "n.amadhila@institution.example",
    credits: 16,
    outline: "Principles of curriculum development, alignment, and evaluation in basic education.",
    materials: [
      { name: "Course outline 2026", type: "pdf" },
      { name: "Week 1–4 lecture slides", type: "slides" },
      { name: "Curriculum mapping tutorial", type: "video" },
    ],
    nextDeadline: { title: "Assignment 2: Curriculum map", due: "2026-06-18" },
  },
  {
    code: "EDU310",
    title: "Practicum II",
    lecturer: "Ms. T. Haufiku",
    lecturerEmail: "t.haufiku@institution.example",
    credits: 24,
    outline: "Supervised school placement with weekly reflective seminars and mentor assessment.",
    materials: [
      { name: "Placement handbook", type: "pdf" },
      { name: "Reflection journal template", type: "pdf" },
    ],
    nextDeadline: { title: "Reflective journal — Week 6", due: "2026-06-14" },
  },
  {
    code: "EDU305",
    title: "Inclusive Education",
    lecturer: "Prof. L. Shipena",
    lecturerEmail: "l.shipena@institution.example",
    credits: 16,
    outline: "Designing learning environments that accommodate diverse learner needs.",
    materials: [
      { name: "Course outline 2026", type: "pdf" },
      { name: "Case studies pack", type: "pdf" },
      { name: "Guest lecture recording", type: "video" },
    ],
    nextDeadline: { title: "Quiz 3: Learner support", due: "2026-06-12" },
  },
];

// ─── Academic progress ──────────────────────────────────────────────────────

export const ACADEMIC_PROGRESS = {
  creditsCompleted: 272,
  creditsTotal: 400,
  cgpa: 3.42,
  gpaHistory: [
    { term: "S2 2024", gpa: 2.6 },
    { term: "S1 2025", gpa: 2.9 },
    { term: "S2 2025", gpa: 2.8 },
    { term: "S1 2026", gpa: 3.1 },
  ],
  expectedGraduation: "November 2027",
};

// ─── Attendance ─────────────────────────────────────────────────────────────

export type ModuleAttendance = {
  code: string;
  title: string;
  attended: number;
  total: number;
  missedDates: string[];
};

export const MODULE_ATTENDANCE: ModuleAttendance[] = [
  { code: "EDU301", title: "Curriculum Design", attended: 11, total: 12, missedDates: ["2026-05-04"] },
  { code: "EDU310", title: "Practicum II", attended: 18, total: 18, missedDates: [] },
  { code: "EDU305", title: "Inclusive Education", attended: 8, total: 11, missedDates: ["2026-04-21", "2026-05-12", "2026-05-26"] },
];

// ─── Assessments ────────────────────────────────────────────────────────────

export type Assessment = {
  id: string;
  module: string;
  title: string;
  type: "assignment" | "quiz" | "test";
  due: string;
  status: "open" | "submitted" | "graded";
  mark?: number;
  feedback?: string;
};

export const ASSESSMENTS: Assessment[] = [
  { id: "a1", module: "EDU305", title: "Quiz 3: Learner support", type: "quiz", due: "2026-06-12", status: "open" },
  { id: "a2", module: "EDU310", title: "Reflective journal — Week 6", type: "assignment", due: "2026-06-14", status: "open" },
  { id: "a3", module: "EDU301", title: "Assignment 2: Curriculum map", type: "assignment", due: "2026-06-18", status: "open" },
  { id: "a4", module: "EDU301", title: "Assignment 1: Needs analysis", type: "assignment", due: "2026-05-15", status: "graded", mark: 74, feedback: "Strong analysis; expand the stakeholder section next time." },
  { id: "a5", module: "EDU305", title: "Quiz 2: Policy frameworks", type: "quiz", due: "2026-05-08", status: "graded", mark: 85, feedback: "Excellent." },
  { id: "a6", module: "EDU310", title: "Lesson plan portfolio", type: "assignment", due: "2026-05-30", status: "submitted" },
];

// ─── Examination centre ─────────────────────────────────────────────────────

export type ExamEntry = {
  module: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  seat: string;
};

export const EXAM_TIMETABLE: ExamEntry[] = [
  { module: "EDU301", title: "Curriculum Design", date: "2026-06-22", time: "09:00–12:00", venue: "Main Hall A", seat: "B14" },
  { module: "EDU305", title: "Inclusive Education", date: "2026-06-25", time: "14:00–17:00", venue: "Main Hall B", seat: "C07" },
  { module: "EDU310", title: "Practicum II (oral)", date: "2026-06-29", time: "10:30–11:00", venue: "Education Block, Room 3", seat: "—" },
];

export const EXAM_PERMIT = {
  status: "issued" as "issued" | "blocked",
  reason: "All fees within permitted threshold",
  permitNumber: "EP-2026-08841",
};

// ─── Documents & certificate vault ──────────────────────────────────────────

export type StudentDocument = {
  name: string;
  description: string;
  updated: string;
};

export const STUDENT_DOCUMENTS: StudentDocument[] = [
  { name: "Proof of registration", description: "Official registration confirmation with QR verification", updated: "2026-02-01" },
  { name: "Academic transcript", description: "Full academic record to date, QR-verified", updated: "2026-06-01" },
  { name: "Enrollment letter", description: "Letter confirming active enrollment for 2026", updated: "2026-02-01" },
  { name: "Completion letter", description: "Available on completion of programme", updated: "—" },
];

export const CERTIFICATE_VAULT = [
  { name: "First Aid Level 1 Certificate", issuer: "Red Cross", year: 2025 },
  { name: "Dean's Merit Award", issuer: "Faculty of Education", year: 2025 },
  { name: "Digital Literacy Badge", issuer: "ICT Department", year: 2024 },
];

// ─── Library ────────────────────────────────────────────────────────────────

export const LIBRARY_LOANS = [
  { title: "Curriculum: Foundations, Principles, and Issues", author: "Ornstein & Hunkins", due: "2026-06-15", overdue: false },
  { title: "Inclusive Education in Africa", author: "M. Chitiyo", due: "2026-06-08", overdue: true },
];

export const LIBRARY_FINES = 35;

// ─── Hostel ─────────────────────────────────────────────────────────────────

export const HOSTEL = {
  allocated: true,
  residence: "Acacia Residence Block C",
  room: "C-214 (shared, 2 beds)",
  feesOutstanding: 1200,
  maintenanceRequests: [
    { id: "m1", issue: "Broken desk lamp", logged: "2026-05-28", status: "in progress" },
    { id: "m2", issue: "Window latch repair", logged: "2026-04-10", status: "resolved" },
  ],
};

// ─── Messages & announcements ───────────────────────────────────────────────

export type MessageThread = {
  id: string;
  with: string;
  department: string;
  subject: string;
  messages: { from: "me" | "them"; text: string; at: string }[];
};

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: "t1",
    with: "Dr. N. Amadhila",
    department: "Lecturer — EDU301",
    subject: "Assignment 2 extension",
    messages: [
      { from: "me", text: "Good day Dr, may I request a 2-day extension on Assignment 2 due to my school placement schedule?", at: "2026-06-08 14:02" },
      { from: "them", text: "Granted — submit by 20 June without penalty. Please attach your placement letter.", at: "2026-06-08 16:45" },
    ],
  },
  {
    id: "t2",
    with: "Finance Office",
    department: "Student accounts",
    subject: "Payment plan query",
    messages: [
      { from: "me", text: "Can I arrange a payment plan for my outstanding balance before exams?", at: "2026-06-05 09:12" },
      { from: "them", text: "Yes — visit the finance office or reply with your preferred monthly amount and we will draft an agreement.", at: "2026-06-05 11:30" },
    ],
  },
];

export type Announcement = {
  scope: "university" | "faculty" | "department";
  title: string;
  body: string;
  date: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  { scope: "university", title: "Semester 2 registration opens 1 July", body: "Online registration for Semester 2, 2026 opens on 1 July. Clear outstanding balances to avoid registration holds.", date: "2026-06-09" },
  { scope: "faculty", title: "Education Faculty research day", body: "Submit poster abstracts by 30 June. Open to all undergraduate students.", date: "2026-06-07" },
  { scope: "department", title: "EDU310 placement schedules updated", body: "Check the practicum portal for your updated school placement roster.", date: "2026-06-06" },
  { scope: "university", title: "Exam permits now available", body: "Download your exam permit from the Examination Centre. Permits are required at all venues.", date: "2026-06-05" },
];

export type Notification = {
  kind: "results" | "registration" | "fees" | "deadline";
  text: string;
  at: string;
};

export const NOTIFICATIONS: Notification[] = [
  { kind: "deadline", text: "Quiz 3 (EDU305) due in 2 days", at: "2026-06-10" },
  { kind: "fees", text: "N$ 3,500 outstanding — payment plan available", at: "2026-06-09" },
  { kind: "registration", text: "Semester 2 registration opens 1 July", at: "2026-06-09" },
  { kind: "results", text: "Semester 1 results released", at: "2026-06-02" },
];

// ─── Career portal ──────────────────────────────────────────────────────────

export type CareerOpportunity = {
  title: string;
  organisation: string;
  type: "internship" | "graduate" | "part-time" | "placement";
  location: string;
  closing: string;
};

export const CAREER_OPPORTUNITIES: CareerOpportunity[] = [
  { title: "Teaching Assistant Internship", organisation: "Ministry of Education", type: "internship", location: "Multiple regions", closing: "2026-06-30" },
  { title: "Graduate Teacher Programme 2027", organisation: "Private Schools Association", type: "graduate", location: "National", closing: "2026-08-15" },
  { title: "Weekend Tutor (Mathematics)", organisation: "Bright Futures Tutoring", type: "part-time", location: "City Campus area", closing: "2026-06-20" },
  { title: "School Placement — Term 3", organisation: "Partner schools network", type: "placement", location: "Various", closing: "2026-07-10" },
];

export const ALUMNI_MENTORS = [
  { name: "R. Nangolo (Class of 2019)", role: "School Principal", focus: "Leadership in education" },
  { name: "S. Iipinge (Class of 2021)", role: "Curriculum Specialist", focus: "Curriculum careers" },
];

// ─── Events, clubs & sports ─────────────────────────────────────────────────

export const CAMPUS_EVENTS = [
  { title: "Career Fair 2026", date: "2026-06-19", venue: "Main Hall", category: "Career" },
  { title: "Research Methods Workshop", date: "2026-06-16", venue: "Library Lab 2", category: "Workshop" },
  { title: "Inter-residence Soccer Final", date: "2026-06-21", venue: "Sports Field", category: "Sports" },
  { title: "Education Conference (student day)", date: "2026-07-03", venue: "Auditorium", category: "Conference" },
];

export const CLUBS = [
  { name: "Future Teachers Society", members: 142, joined: true },
  { name: "Debate Club", members: 67, joined: false },
  { name: "Choir", members: 89, joined: false },
  { name: "Environmental Club", members: 54, joined: false },
];

export const SPORTS_FIXTURES = [
  { sport: "Soccer", fixture: "Block C vs Block A", date: "2026-06-21", result: "Upcoming" },
  { sport: "Netball", fixture: "Acacia vs Horizon (friendly)", date: "2026-06-14", result: "Won 38–31" },
];

// ─── Requests & complaints ──────────────────────────────────────────────────

export const REQUEST_TYPES = [
  "Transcript",
  "Letter of enrollment",
  "Academic appeal",
  "Change of programme",
  "Module add/drop",
] as const;

export type ServiceRequest = {
  id: string;
  type: string;
  submitted: string;
  status: "pending" | "processing" | "completed";
};

export const EXISTING_REQUESTS: ServiceRequest[] = [
  { id: "r1", type: "Letter of enrollment", submitted: "2026-06-01", status: "completed" },
  { id: "r2", type: "Module add/drop", submitted: "2026-06-07", status: "processing" },
];

// ─── Wellness ───────────────────────────────────────────────────────────────

export const WELLNESS_SLOTS = [
  { service: "Counseling session", slot: "2026-06-12, 10:00", provider: "Student Counseling Unit" },
  { service: "Health clinic check-up", slot: "2026-06-13, 14:30", provider: "Campus Clinic" },
  { service: "Counseling session", slot: "2026-06-15, 09:00", provider: "Student Counseling Unit" },
];

export const WELLNESS_RESOURCES = [
  "24/7 mental health helpline: 081 000 0000 (demo)",
  "Exam stress management guide (PDF)",
  "Peer support groups — Wednesdays 17:00, Student Centre",
];

// ─── Sponsorship ────────────────────────────────────────────────────────────

export const SPONSORSHIP = {
  funder: "Government Student Fund (demo)",
  status: "Approved — 2026 academic year",
  covered: ["Tuition (100%)", "Hostel (50%)", "Book allowance N$ 2,500/yr"],
  payments: [
    { date: "2026-02-10", description: "Tuition disbursement S1", amount: 14000 },
    { date: "2026-03-15", description: "Book allowance", amount: 2500 },
  ],
};
