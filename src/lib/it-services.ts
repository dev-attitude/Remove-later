/** Full IT & digital transformation catalogue for Skyrapay Consultations CC */

export type ItServiceCategory = {
  id: string;
  title: string;
  description?: string;
  items: readonly string[];
};

export const IT_SERVICES_POSITIONING =
  "Skyrapay Consultations CC is a full-service IT and digital transformation consultancy. We serve businesses, schools, hospitals, government institutions, NGOs, and individuals across Namibia—from custom software and websites to hardware repair, networks, cybersecurity, cloud, AI, and training.";

export const IT_SERVICE_PILLARS = [
  "Software Development",
  "IT Support & Maintenance",
  "Networking & Connectivity",
  "Cybersecurity",
  "Cloud Services",
  "Digital Transformation",
  "Research & Data Solutions",
  "Training & Capacity Building",
] as const;

/** High-demand services in Namibia — featured on the IT services page */
export const HIGH_DEMAND_IT_SERVICES = [
  "Website Development",
  "School Management Systems",
  "Hospital Management Systems",
  "Retail / POS Systems",
  "Payroll Systems",
  "IT Support Contracts",
  "Network Installation",
  "Cybersecurity Services",
  "AI Solutions",
  "Digital Transformation Consulting",
] as const;

export const IT_SERVICE_CATEGORIES: readonly ItServiceCategory[] = [
  {
    id: "software-development",
    title: "Software Development Services",
    items: [
      "Custom Management Systems",
      "School Management Systems",
      "Hospital Management Systems",
      "Student Information Systems",
      "HR & Payroll Systems",
      "Retail & POS Systems",
      "Inventory Management Systems",
      "Taxi Management Systems",
      "Guesthouse & Hotel Management Systems",
      "Church Management Systems",
      "Document Management Systems",
      "CRM (Customer Relationship Management) Systems",
      "Mobile App Development",
      "Website Development",
    ],
  },
  {
    id: "it-support",
    title: "IT Support & Maintenance",
    items: [
      "Computer Repairs",
      "Laptop Repairs",
      "Printer Troubleshooting",
      "Software Installation",
      "Operating System Installation",
      "Virus Removal",
      "Data Recovery",
      "System Optimization",
      "Preventive Maintenance",
      "Annual Maintenance Contracts",
    ],
  },
  {
    id: "network",
    title: "Network Services",
    items: [
      "Network Design and Installation",
      "Wi-Fi Setup",
      "Router Configuration",
      "Office Networking",
      "Network Troubleshooting",
      "VPN Configuration",
      "Internet Connectivity Solutions",
      "Network Security Assessments",
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Services",
    items: [
      "Security Audits",
      "Vulnerability Assessments",
      "Data Protection Consulting",
      "Password Policy Implementation",
      "Cybersecurity Awareness Training",
      "Backup and Disaster Recovery Planning",
      "Endpoint Protection Solutions",
      "Email Security Setup",
    ],
  },
  {
    id: "cloud",
    title: "Cloud Services",
    items: [
      "Cloud Migration",
      "Cloud Storage Solutions",
      "Microsoft 365 Setup",
      "Google Workspace Setup",
      "Email Hosting",
      "Website Hosting",
      "Domain Registration Assistance",
      "Cloud Backup Solutions",
    ],
  },
  {
    id: "digital-transformation",
    title: "Digital Transformation Consulting",
    description:
      "Many organisations still use paper-based processes. We help you modernise operations end to end.",
    items: [
      "Digitize Records",
      "Implement Electronic Filing Systems",
      "Automate Workflows",
      "Develop Online Application Systems",
      "Create Employee Self-Service Portals",
      "Implement Digital Approval Systems",
    ],
  },
  {
    id: "data-reporting",
    title: "Data & Reporting Services",
    items: [
      "Dashboard Development",
      "Business Intelligence Solutions",
      "Data Analysis",
      "Performance Monitoring Systems",
      "Custom Reporting Tools",
      "Research Data Management Systems",
    ],
  },
  {
    id: "training",
    title: "Training Services",
    items: [
      "Basic Computer Training",
      "Microsoft Office Training",
      "Research Software Training",
      "Cybersecurity Awareness Training",
      "Digital Literacy Programs",
      "AI Tools Training",
      "Website Management Training",
      "System User Training",
    ],
  },
  {
    id: "education",
    title: "Specialized Services for Schools & Colleges",
    items: [
      "Student Registration Systems",
      "Learning Management Systems (LMS)",
      "Online Examination Systems",
      "Attendance Tracking Systems",
      "Library Management Systems",
      "Hostel Management Systems",
      "Timetable Management Systems",
    ],
  },
  {
    id: "healthcare",
    title: "Specialized Services for Healthcare Facilities",
    items: [
      "Electronic Medical Records (EMR)",
      "Patient Management Systems",
      "Appointment Booking Systems",
      "Pharmacy Management Systems",
      "Hospital Inventory Systems",
      "Staff Scheduling Systems",
      "Quality Improvement Dashboards",
      "Research Management Platforms",
    ],
  },
  {
    id: "ai",
    title: "AI Consulting Services",
    description: "Rapidly growing capabilities for institutions and enterprises.",
    items: [
      "AI Chatbots",
      "AI-Powered Customer Support",
      "Research Assistance Platforms",
      "AI Content Humanization Tools",
      "AI Knowledge Bases",
      "AI Document Analysis",
      "AI Workflow Automation",
      "AI Report Generation",
    ],
  },
  {
    id: "graphic-branding",
    title: "Graphic & Branding Services",
    items: [
      "Logo Design",
      "Company Profiles",
      "Business Cards",
      "Flyers",
      "Posters",
      "Social Media Graphics",
      "Corporate Branding",
      "Marketing Materials",
    ],
  },
] as const;

export const IT_SERVICE_AUDIENCES = [
  "Schools & colleges",
  "Hospitals & clinics",
  "Councils & ministries",
  "NGOs",
  "Private companies",
  "Entrepreneurs & SMEs",
] as const;
