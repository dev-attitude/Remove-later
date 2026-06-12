import type { LucideIcon } from "lucide-react";
import {
  Monitor,
  Briefcase,
  GraduationCap,
  Smartphone,
  Server,
  Globe,
  Laptop,
  ShoppingBag,
  Headphones,
  PenLine,
  BookMarked,
} from "lucide-react";

import { BRAND } from "./brand";
import { domainPriceListRows } from "./domain-pricing";

export const COMPANY = {
  name: BRAND.companyLegal,
  shortName: BRAND.companyName,
  tagline: BRAND.tagline,
  productName: BRAND.productName,
  email: "97transformative@gmail.com",
  phones: ["+264 81 298 6481", "+264 81 877 4482"] as const,
  /** Primary phone for tel: links */
  phone: "+264812986481",
  offices: ["Osona", "Okahandja", "Windhoek"] as const,
  location: "Osona · Okahandja · Windhoek, Namibia",
  poBox: "P.O. Box 5141, Divundu, Namibia",
  businessHours: {
    days: "Monday – Friday",
    time: "08:00 – 18:00",
    note: "All business consultations are scheduled within these hours.",
  },
  researchAppPath: "/research",
} as const;

export type ServiceSlug =
  | "it-consulting"
  | "student-assistance"
  | "assignment-writing"
  | "research-writing"
  | "business-consulting"
  | "gadgets"
  | "system-development"
  | "web-app-development";

export type ServiceItem = {
  slug: ServiceSlug;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  deliverables: string[];
};

export const SERVICES: ServiceItem[] = [
  {
    slug: "it-consulting",
    title: "IT Services",
    short:
      "Full-service IT and digital transformation—software, support, networks, security, cloud, AI, and training.",
    description:
      "As an IT consulting company, Skyrapay Consultations CC offers a wide range of services to businesses, schools, hospitals, government institutions, NGOs, and individuals. With experience in web development, system development, hardware repair, and IT support, we help you plan, build, secure, and maintain technology that fits how your organisation actually works.",
    icon: Monitor,
    features: [
      "Custom software—school, hospital, POS, HR, CRM & more",
      "IT support, repairs & annual maintenance contracts",
      "Network design, Wi-Fi, VPN & connectivity",
      "Cybersecurity audits, backup & endpoint protection",
      "Cloud migration, Microsoft 365 & Google Workspace",
      "Digital transformation—digitize records & automate workflows",
      "Dashboards, BI, data analysis & research platforms",
      "AI chatbots, document analysis & workflow automation",
      "Training—Office, cybersecurity, digital literacy & AI tools",
    ],
    deliverables: [
      "Discovery session & scoped proposal",
      "Implemented systems, sites, or infrastructure",
      "Documentation & user training",
      "Ongoing support or maintenance contract (optional)",
    ],
  },
  {
    slug: "student-assistance",
    title: "Student Assistance",
    short:
      "Overview of our academic support—assignment writing, research projects, data collection, and analysis for all levels.",
    description:
      "Skyrapay Consultations CC helps students succeed academically with structured support for assignments, research projects, dissertations, and theses. Choose dedicated Assignment Writing or Research Writing services for fixed packages, or contact us for data collection and analysis. Many students also use our Skyrapay Research Suite platform for AI-assisted writing, literature search, citations, and research planning.",
    icon: GraduationCap,
    features: [
      "Dedicated assignment writing packages (school to postgraduate)",
      "Research proposals, dissertations & thesis support",
      "Literature review & reference management",
      "Questionnaire & interview guide design",
      "Field & online data collection support",
      "Quantitative analysis (SPSS, Excel, R where needed)",
      "Qualitative analysis & thematic coding",
      "Formatting to institutional guidelines (APA, Harvard, etc.)",
    ],
    deliverables: [
      "Clear, rubric-aligned drafts and revisions",
      "Research documents with proper citations",
      "Data collection instruments & cleaned datasets",
      "Tables, charts & analysis write-ups",
      "One-on-one consultation (Mon–Fri 08:00–18:00)",
      "Optional access guidance for Skyrapay Research Suite",
    ],
  },
  {
    slug: "assignment-writing",
    title: "Assignment Writing",
    short:
      "Professional assignment and essay writing for school, college, and university—structured to your rubric and deadline.",
    description:
      "Get expert help with essays, reports, case studies, and module assignments at every academic level. We work to your faculty guidelines, word count, and deadline—with editing, proofreading, and proper formatting included. Ideal when you need a polished draft to review and learn from while meeting institutional standards.",
    icon: PenLine,
    features: [
      "High school, TVET, diploma & degree assignments",
      "Essays, reports, case studies & reflective writing",
      "Editing, proofreading & paraphrasing",
      "APA, Harvard, MLA & institutional formatting",
      "Rush deadlines (subject to availability)",
      "Plagiarism-conscious original drafts",
      "Revision rounds before submission",
    ],
    deliverables: [
      "Rubric-aligned assignment draft",
      "Reference list & in-text citations",
      "Formatted document (Word/PDF)",
      "Brief writer notes on structure & key arguments",
      "Optional consultation call",
    ],
  },
  {
    slug: "research-writing",
    title: "Research Writing",
    short:
      "Research proposals, dissertation chapters, literature reviews, and full thesis support—from topic to final submission.",
    description:
      "Structured research writing for honours, masters, and doctoral students. We support proposals, methodology chapters, literature reviews, results discussions, and full dissertation or thesis projects—aligned with your supervisor feedback and ethics requirements.",
    icon: BookMarked,
    features: [
      "Research proposals & ethics applications",
      "Chapter 1–5 structure & drafting",
      "Literature review & research gap analysis",
      "Methodology & research design chapters",
      "Results, discussion & conclusion chapters",
      "Supervisor feedback revisions",
      "Full dissertation / thesis project management",
    ],
    deliverables: [
      "Chapter-by-chapter or full research document",
      "Proper academic citations & bibliography",
      "Tables, figures & appendices as scoped",
      "Revision support after supervisor comments",
      "Progress updates throughout the project",
    ],
  },
  {
    slug: "business-consulting",
    title: "Business Consultation Services",
    short:
      "Registration, business plans, branding, websites, and growth strategy for Namibian SMEs.",
    description:
      "Skyrapay Consultations CC supports entrepreneurs and established businesses across Namibia—from CC and (Pty) Ltd registration with BIPA, NamRA, and Social Security, to business plans, proposals, logo and flyer design, and professional websites. We handle the paperwork so you can focus on running your business.",
    icon: Briefcase,
    features: [
      "CC & (Pty) Ltd business registration (BIPA, NamRA, Social Security, SME)",
      "Fixed-price registration packages (CC, cash loan, NGO)",
      "Business plans & business proposals",
      "Logo design & marketing flyers for your brand",
      "Business websites development",
      "Operational consulting, feasibility & growth strategy",
      "Process mapping, compliance & policy frameworks",
    ],
    deliverables: [
      "Completed registration filings & certificates (per package)",
      "Business plan or proposal document",
      "Logo files & print-ready flyer artwork",
      "Live business website (scoped separately or bundled)",
      "Consultation sessions within Mon–Fri 08:00–18:00",
    ],
  },
  {
    slug: "gadgets",
    title: "Sales of Gadgets",
    short: "Laptops, phones, accessories, and tech for work and study.",
    description:
      "Source quality devices and accessories at competitive prices—with advice on what fits your budget, coursework, or office needs.",
    icon: Smartphone,
    features: [
      "Laptops & desktops",
      "Smartphones & tablets",
      "Networking equipment",
      "Printers & peripherals",
      "Bulk orders for schools & offices",
    ],
    deliverables: [
      "Product recommendations",
      "Warranty guidance",
      "Setup & basic configuration",
      "After-sales support",
    ],
  },
  {
    slug: "system-development",
    title: "System Development",
    short: "Custom software, databases, and enterprise systems built for your workflow.",
    description:
      "From internal tools to full enterprise platforms—we design, build, and maintain systems that match how your organisation actually works.",
    icon: Server,
    features: [
      "Requirements analysis & UX design",
      "Web & desktop applications",
      "API & database architecture",
      "Integration with existing tools",
      "Maintenance & support SLAs",
    ],
    deliverables: [
      "Source code & documentation",
      "Staging & production deployment",
      "User training",
      "Security & backup setup",
    ],
  },
  {
    slug: "web-app-development",
    title: "Web & App Development",
    short: "Beautiful, fast websites and mobile apps that convert visitors into clients.",
    description:
      "We craft responsive websites, web applications, and mobile experiences—with SEO, performance, and brand identity built in from day one.",
    icon: Globe,
    features: [
      "Corporate & portfolio websites",
      "E-commerce & booking systems",
      "Progressive web apps (PWA)",
      "iOS & Android apps",
      "Hosting, SSL & domain setup",
    ],
    deliverables: [
      "Fully responsive site or app",
      "CMS or admin panel (where needed)",
      "Analytics & SEO baseline",
      "Launch support & handover",
    ],
  },
];

export const HOSTING_OFFERINGS: BusinessPackage[] = [
  {
    id: "hosting-domain",
    name: "Domain Registration",
    price: 159.85,
    currency: "NAD",
    priceLabel: "From per year",
    description:
      "Buy and own your domain name through GM Consultations—.com, .com.na, .org, .net, and more. We register it in your name and manage renewals.",
    popular: true,
    includes: [
      "Search & register new domains",
      "Transfer existing domains to us",
      "DNS management (A, CNAME, MX, TXT)",
      "Domain privacy where available",
      "Renewal reminders before expiry",
      "Point domain to your website or email",
    ],
  },
  {
    id: "hosting-website",
    name: "Website Hosting",
    price: 199,
    currency: "NAD",
    priceLabel: "From per month",
    description:
      "Host your own website on cPanel—upload files, install WordPress, run PHP apps, and manage everything from your hosting account.",
    includes: [
      "Your own cPanel hosting account",
      "SSD storage & bandwidth",
      "FTP / SFTP & File Manager",
      "One-click WordPress & app installers",
      "Free SSL certificate",
      "Subdomains & addon domains",
    ],
  },
  {
    id: "hosting-email",
    name: "Business Email",
    price: 150,
    currency: "NAD",
    priceLabel: "From per month",
    description:
      "Create professional @yourdomain.com email accounts—webmail, Outlook, and mobile sync for your whole team.",
    includes: [
      "Create mailboxes on your domain",
      "Webmail access (Roundcube / Horde)",
      "Outlook, Apple Mail & mobile setup",
      "Spam & virus filtering",
      "Autoresponders & email forwarding",
      "Catch-all & alias addresses",
    ],
  },
  {
    id: "hosting-mysql",
    name: "MySQL Databases",
    price: 0,
    currency: "NAD",
    priceLabel: "Included with hosting",
    description:
      "Create and manage MySQL databases for WordPress, custom apps, and online stores—access via phpMyAdmin from cPanel.",
    includes: [
      "Create MySQL databases in cPanel",
      "phpMyAdmin database management",
      "Database users & permissions",
      "Remote MySQL (where supported)",
      "Import / export SQL backups",
      "Works with WordPress, Laravel, PHP apps",
    ],
  },
  {
    id: "hosting-backup",
    name: "Website Backups",
    price: 50,
    currency: "NAD",
    priceLabel: "From per month",
    description:
      "Automated backups of your website files and databases—restore quickly if something goes wrong.",
    includes: [
      "Scheduled automated backups",
      "Files + MySQL database backups",
      "One-click restore from cPanel",
      "Off-site backup storage",
      "Backup before major updates",
      "Disaster recovery assistance",
    ],
  },
  {
    id: "hosting-ssl",
    name: "SSL Certificates",
    price: 0,
    currency: "NAD",
    priceLabel: "Free with hosting",
    description:
      "Secure HTTPS for every site—AutoSSL installs and renews certificates so visitors always see the padlock.",
    includes: [
      "Free SSL on all hosted domains",
      "Auto-install & auto-renewal",
      "HTTPS redirect setup",
      "Works with subdomains",
      "Expiry monitoring",
      "Premium / EV SSL available on request",
    ],
  },
  {
    id: "hosting-maintenance",
    name: "Managed Maintenance",
    price: 350,
    currency: "NAD",
    priceLabel: "From per month",
    description:
      "Prefer hands-off? We update WordPress, monitor uptime, and make content changes so you don't have to log in to cPanel.",
    includes: [
      "WordPress / CMS plugin & core updates",
      "Security patches & uptime monitoring",
      "Content & text updates (fair use)",
      "Broken link & form checks",
      "Monthly health report",
      "Priority support during business hours",
    ],
  },
];

/** Website hosting tiers (reseller cPanel — each customer gets their own account) */
export const HOSTING_WEBSITE_PLANS: BusinessPackage[] = [
  {
    id: "hosting-starter",
    name: "Starter",
    price: 199,
    currency: "NAD",
    priceLabel: "Per month",
    description:
      "One domain, one website, email & MySQL—everything you need to get your business online.",
    includes: [
      "1 website / 1 domain",
      "10 GB SSD storage",
      "5 email accounts",
      "2 MySQL databases",
      "Free SSL certificate",
      "Full cPanel access",
    ],
  },
  {
    id: "hosting-business",
    name: "Business",
    price: 499,
    currency: "NAD",
    priceLabel: "Per month",
    description:
      "Multiple sites, more databases, and daily backups for growing Namibian SMEs and online stores.",
    popular: true,
    includes: [
      "Up to 3 websites / domains",
      "50 GB SSD storage",
      "Unlimited email accounts",
      "10 MySQL databases",
      "Daily backups & restore",
      "Free website migration",
    ],
  },
  {
    id: "hosting-premium",
    name: "Corporate",
    price: 999,
    currency: "NAD",
    priceLabel: "Per month",
    description:
      "High-traffic sites and developers who need more storage, databases, and priority support.",
    includes: [
      "Up to 5 websites / domains",
      "100 GB SSD storage",
      "Unlimited email accounts",
      "Unlimited MySQL databases",
      "Daily backups + staging",
      "Same-day priority support",
    ],
  },
];

/** What customers can do from their cPanel account */
export const HOSTING_PLATFORM_FEATURES = [
  {
    title: "Register & manage domains",
    text: "Buy new domains, transfer existing ones, and edit DNS records—all from your account.",
  },
  {
    title: "Host your website",
    text: "Upload files via FTP, use File Manager, install WordPress in one click, and run PHP applications.",
  },
  {
    title: "Create business email",
    text: "Set up @yourdomain.com mailboxes, autoresponders, and forwarders. Access via webmail or your phone.",
  },
  {
    title: "MySQL databases",
    text: "Create databases for WordPress, custom apps, and e-commerce. Manage tables with phpMyAdmin.",
  },
  {
    title: "SSL & security",
    text: "Free AutoSSL on every domain, IP blocker, hotlink protection, and optional two-factor login.",
  },
  {
    title: "Developer tools",
    text: "PHP version selector, cron jobs, error logs, Git version control, and SSH access on higher plans.",
  },
] as const;

export const HOSTING_INCLUDED = [
  "Domain registration & DNS management",
  "cPanel hosting account with full access",
  "Business email accounts on your domain",
  "MySQL databases & phpMyAdmin",
  "Free SSL certificates (AutoSSL)",
  "FTP / SFTP, File Manager & one-click installers",
  "Automated backups (plan dependent)",
  "Free website migration to our platform",
  "Cloud, VPS & dedicated servers on request",
  "Server management & disaster recovery planning",
  "Optional managed maintenance from our team",
] as const;

/**
 * Entry-level price list — affordable launch pricing with room for upselling.
 * Amounts are stored in NAD and converted to the visitor's local currency at display time.
 * amountNad of 0 means the item is free; suffix is appended after the formatted price.
 */
export type PriceRow = { service: string; amountNad: number; suffix?: string };
export type PriceCategory = { id: string; title: string; rows: PriceRow[] };

export const ENTRY_PRICE_LIST: PriceCategory[] = [
  {
    id: "domains",
    title: "Hosting & Domain Services",
    rows: [
      ...domainPriceListRows(),
      { service: "DNS Management", amountNad: 100, suffix: "/month" },
      { service: "Domain Transfer", amountNad: 350, suffix: " once-off" },
    ],
  },
  {
    id: "hosting",
    title: "Website Hosting",
    rows: [
      { service: "Starter Website Hosting", amountNad: 199, suffix: "/month" },
      { service: "Business Website Hosting", amountNad: 499, suffix: "/month" },
      { service: "Corporate Website Hosting", amountNad: 999, suffix: "/month" },
      { service: "Website Migration", amountNad: 500, suffix: " once-off" },
      { service: "Additional Storage Upgrade", amountNad: 100, suffix: "/month" },
    ],
  },
  {
    id: "email",
    title: "Business Email Hosting",
    rows: [
      { service: "5 Email Accounts", amountNad: 150, suffix: "/month" },
      { service: "10 Email Accounts", amountNad: 250, suffix: "/month" },
      { service: "20 Email Accounts", amountNad: 450, suffix: "/month" },
      { service: "Email Setup", amountNad: 250, suffix: " once-off" },
      { service: "Email Migration", amountNad: 500, suffix: " once-off" },
    ],
  },
  {
    id: "ssl",
    title: "SSL & Security",
    rows: [
      { service: "Free SSL Installation (Let's Encrypt)", amountNad: 0 },
      { service: "Premium SSL Certificate", amountNad: 800, suffix: "/year" },
      { service: "SSL Renewal Assistance", amountNad: 300 },
      { service: "Basic Security Hardening", amountNad: 500 },
    ],
  },
  {
    id: "backups",
    title: "Website Backup & Recovery",
    rows: [
      { service: "Weekly Backup", amountNad: 50, suffix: "/month" },
      { service: "Daily Backup", amountNad: 100, suffix: "/month" },
      { service: "Website Restore", amountNad: 300, suffix: " once-off" },
      { service: "Backup Verification", amountNad: 150 },
    ],
  },
  {
    id: "maintenance",
    title: "Website Maintenance",
    rows: [
      { service: "Basic Maintenance", amountNad: 350, suffix: "/month" },
      { service: "Standard Maintenance", amountNad: 750, suffix: "/month" },
      { service: "Premium Maintenance", amountNad: 1500, suffix: "/month" },
    ],
  },
  {
    id: "webdev",
    title: "Website Design & Development",
    rows: [
      { service: "Single Landing Page", amountNad: 2500 },
      { service: "Small Business Website (3–5 pages)", amountNad: 5000 },
      { service: "School Website", amountNad: 8000 },
      { service: "NGO/Church Website", amountNad: 6000 },
      { service: "E-Commerce Website", amountNad: 15000 },
      { service: "Website Redesign", amountNad: 3000 },
    ],
  },
  {
    id: "security",
    title: "Cybersecurity Services",
    rows: [
      { service: "Website Security Audit", amountNad: 1500 },
      { service: "Malware Removal", amountNad: 1000 },
      { service: "Firewall Configuration", amountNad: 1000 },
      { service: "Security Monitoring", amountNad: 500, suffix: "/month" },
      { service: "Vulnerability Assessment", amountNad: 2500 },
    ],
  },
  {
    id: "support",
    title: "IT Support & Repairs",
    rows: [
      { service: "PC/Laptop Diagnostic", amountNad: 250 },
      { service: "Software Installation", amountNad: 300 },
      { service: "Virus Removal", amountNad: 500 },
      { service: "Hardware Repair (Labour)", amountNad: 500, suffix: "+" },
      { service: "Network/Wi-Fi Setup", amountNad: 800 },
      { service: "Remote Support (per hour)", amountNad: 250, suffix: "/hour" },
    ],
  },
  {
    id: "cloud",
    title: "Cloud & Business Technology",
    rows: [
      { service: "Microsoft 365 Setup", amountNad: 500 },
      { service: "Google Workspace Setup", amountNad: 500 },
      { service: "Cloud Backup Setup", amountNad: 350 },
      { service: "Remote Work Solution Setup", amountNad: 1500 },
      { service: "Business Email Integration", amountNad: 500 },
    ],
  },
  {
    id: "marketing",
    title: "Digital Marketing & Branding",
    rows: [
      { service: "Logo Design", amountNad: 500 },
      { service: "Business Cards", amountNad: 500 },
      { service: "Flyer Design", amountNad: 500 },
      { service: "Social Media Setup", amountNad: 500 },
      { service: "Basic SEO Setup", amountNad: 1500 },
      { service: "Facebook/Google Ads Setup", amountNad: 1000 },
    ],
  },
  {
    id: "business",
    title: "Business Support Services",
    rows: [
      { service: "CC Registration (All Inclusive)", amountNad: 5660 },
      { service: "NGO/Church Registration", amountNad: 4550 },
      { service: "Company Profile Design", amountNad: 2000 },
      { service: "Business Email & Domain Package", amountNad: 950, suffix: " setup" },
    ],
  },
];

/** Flagship starter bundle — easy first sale for new companies (NAD base prices) */
export const STARTER_BUNDLE = {
  name: "Business Startup Package",
  upfrontNad: 7500,
  monthlyNad: 499,
  audience: "Ideal for new companies going online for the first time.",
  includes: [
    "CC Registration",
    ".com Domain",
    "5 Business Emails",
    "Starter Hosting",
    "Basic Business Website (up to 5 pages)",
    "Free SSL",
  ],
} as const;

/** Full Skyrapay service catalogue — one-stop technology & business solutions */
export type ServiceCategory = {
  id: string;
  title: string;
  summary: string;
  items: string[];
  href: string;
  cta: string;
};

export const SKYRAPAY_SERVICE_CATALOGUE: ServiceCategory[] = [
  {
    id: "hosting-infrastructure",
    title: "Website Hosting & Domains",
    summary: "Pure IT infrastructure — everything to put and keep your business online.",
    items: [
      "Domain registration & DNS management",
      "Website, email & database hosting (MySQL)",
      "Cloud, VPS & dedicated server hosting",
      "SSL certificates & website backups",
      "Server management & website migration",
      "Disaster recovery solutions",
    ],
    href: "/hosting/plans",
    cta: "View hosting plans",
  },
  {
    id: "web-development",
    title: "Website Development",
    summary: "Design and build — from landing pages to full custom platforms.",
    items: [
      "Website design, development & redesign",
      "E-commerce & landing page development",
      "Custom web applications & mobile apps",
      "API & payment gateway integration",
    ],
    href: "/services/web-app-development",
    cta: "Explore web development",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Solutions",
    summary: "Protect your systems, data, and customers.",
    items: [
      "Security audits & vulnerability assessments",
      "Penetration testing & malware removal",
      "Firewall configuration & security monitoring",
      "SSL management & data protection consulting",
      "Backup & recovery planning",
    ],
    href: "/services/it-consulting",
    cta: "Request a security review",
  },
  {
    id: "it-support",
    title: "IT Support & Repairs",
    summary: "Hands-on technical help for offices, schools, and homes.",
    items: [
      "Computer, laptop & printer repairs",
      "Network installation & Wi-Fi setup",
      "Software installation & virus removal",
      "Data recovery & IT help desk",
      "Remote technical support",
    ],
    href: "/services/it-consulting",
    cta: "Get IT support",
  },
  {
    id: "cloud-business",
    title: "Cloud & Business Email Services",
    summary: "Modern workplace tools for teams of any size.",
    items: [
      "Microsoft 365 & Google Workspace setup",
      "Business email systems on your domain",
      "Cloud storage & cloud backup solutions",
      "Online collaboration & remote work solutions",
    ],
    href: "/contact?service=hosting",
    cta: "Set up your workspace",
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing & Branding",
    summary: "Get found and look professional.",
    items: [
      "Logo & graphic design",
      "SEO & online advertising",
      "Social media management",
      "Content management & digital marketing",
    ],
    href: "/quote",
    cta: "Request a quote",
  },
  {
    id: "business-services",
    title: "Business Registration & Compliance",
    summary: "Business consulting and administrative services beyond IT.",
    items: [
      "CC, company & NGO registration",
      "Compliance services & policy development",
      "Business profiles & business plans",
      "Tender documentation",
    ],
    href: "/services/business-consulting",
    cta: "Register your business",
  },
];

/** @deprecated Use HOSTING_OFFERINGS + HOSTING_WEBSITE_PLANS */
export const HOSTING_PLANS: BusinessPackage[] = HOSTING_WEBSITE_PLANS;

export type ShopPackage = {
  id: string;
  name: string;
  priceLabel: string;
  priceFrom: number;
  currency: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  timeline: string;
  popular?: boolean;
};

/** Namibia business registration & document packages (NAD) */
export type BusinessPackage = {
  id: string;
  name: string;
  price: number;
  priceLabel?: string;
  currency: "NAD";
  description: string;
  includes: string[];
  popular?: boolean;
};

export const BUSINESS_REGISTRATION_PACKAGES: BusinessPackage[] = [
  {
    id: "cc-full-registration",
    name: "CC — Full Registration Package",
    price: 1800,
    currency: "NAD",
    description:
      "Complete close corporation (CC) registration for SMEs—everything you need to trade legally in Namibia.",
    popular: true,
    includes: [
      "Name reservation",
      "BIPA registration",
      "SME registration (for SME businesses)",
      "NamRA registration",
      "Social Security registration",
    ],
  },
  {
    id: "cc-cashloan-registration",
    name: "CC — Full Package (Cash Loan)",
    price: 2500,
    currency: "NAD",
    description:
      "Full CC registration package plus NAMFISA requirements—ideal for cash loan and micro-lending businesses.",
    includes: [
      "Name reservation",
      "BIPA registration",
      "SME registration (for SME businesses)",
      "NamRA registration",
      "Social Security registration",
      "NAMFISA registration",
    ],
  },
  {
    id: "ngo-registration",
    name: "NGO Registration",
    price: 2500,
    currency: "NAD",
    description:
      "End-to-end support to register your non-governmental organisation with the relevant Namibian authorities.",
    includes: [
      "Name reservation & entity setup guidance",
      "BIPA / relevant filings",
      "NamRA & compliance registrations",
      "Social Security (where applicable)",
      "Documentation handover & filing support",
    ],
  },
  {
    id: "pty-registration",
    name: "(Pty) Ltd Registration",
    price: 3500,
    currency: "NAD",
    description:
      "Private company (Pty) Ltd registration — our NAD 3,500 fee covers filing and paperwork only (see inclusions below). Does not include lawyer, accountant, or auditor fees; those are billed separately by your chosen professionals.",
    includes: [
      "Name reservation",
      "BIPA registration",
      "NamRA registration",
      "Social Security registration",
      "Memorandum & founding documents — preparation",
      "Document binding",
      "Completion of all registration paperwork",
      "Excludes: lawyer, accountant & auditor charges (client arranges & pays directly)",
    ],
  },
];

/** Assignment writing packages (NAD, ex VAT — use in quotations & invoices) */
export const ASSIGNMENT_WRITING_PACKAGES: BusinessPackage[] = [
  {
    id: "assignment-highschool",
    name: "High School Assignment",
    price: 350,
    priceLabel: "From",
    currency: "NAD",
    description: "Essays, reports, and homework assignments for secondary school learners.",
    includes: [
      "Up to ~1,500 words (scope confirmed on inquiry)",
      "Basic research & citations",
      "Proofreading & formatting",
      "One revision round",
    ],
  },
  {
    id: "assignment-college",
    name: "College / TVET Assignment",
    price: 500,
    priceLabel: "From",
    currency: "NAD",
    description: "Module assignments for certificate, diploma, and TVET programmes.",
    popular: true,
    includes: [
      "Structured report or essay format",
      "Referencing per faculty guidelines",
      "Editing & formatting",
      "One revision round",
    ],
  },
  {
    id: "assignment-undergrad",
    name: "University Assignment",
    price: 750,
    priceLabel: "From",
    currency: "NAD",
    description: "Undergraduate essays, case studies, and module deliverables.",
    includes: [
      "Higher word-count assignments",
      "Academic tone & argument structure",
      "APA / Harvard formatting",
      "Two revision rounds",
    ],
  },
  {
    id: "assignment-postgrad",
    name: "Postgraduate Assignment",
    price: 950,
    priceLabel: "From",
    currency: "NAD",
    description: "Honours and masters-level assignments with deeper analysis.",
    includes: [
      "Advanced academic writing",
      "Critical analysis & literature integration",
      "Institutional formatting",
      "Two revision rounds",
    ],
  },
  {
    id: "assignment-editing",
    name: "Editing & Proofreading",
    price: 300,
    priceLabel: "From",
    currency: "NAD",
    description: "Polish your own draft—grammar, flow, citations, and formatting.",
    includes: [
      "Language & clarity edits",
      "Citation & reference check",
      "Formatting to guidelines",
      "Track-changes or clean copy",
    ],
  },
  {
    id: "assignment-group",
    name: "Group Project / Report",
    price: 1200,
    priceLabel: "From",
    currency: "NAD",
    description: "Collaborative reports and group assignment deliverables.",
    includes: [
      "Consistent structure across sections",
      "Combined references & appendices",
      "Presentation notes (optional)",
      "Team coordination support",
    ],
  },
];

/** Research writing packages (NAD, ex VAT) */
export const RESEARCH_WRITING_PACKAGES: BusinessPackage[] = [
  {
    id: "research-proposal",
    name: "Research Proposal",
    price: 1500,
    priceLabel: "From",
    currency: "NAD",
    description: "Full research proposal for ethics submission and supervisor approval.",
    popular: true,
    includes: [
      "Introduction, problem statement & objectives",
      "Literature review outline",
      "Methodology section",
      "Timeline & budget outline",
    ],
  },
  {
    id: "research-literature",
    name: "Literature Review Chapter",
    price: 2000,
    priceLabel: "From",
    currency: "NAD",
    description: "Standalone literature review chapter with gap identification.",
    includes: [
      "Thematic or chronological review",
      "Recent peer-reviewed sources",
      "Critical synthesis & research gap",
      "Full reference list",
    ],
  },
  {
    id: "research-methodology",
    name: "Methodology Chapter",
    price: 1800,
    priceLabel: "From",
    currency: "NAD",
    description: "Research design, instruments, sampling, and analysis plan.",
    includes: [
      "Design justification",
      "Data collection instruments",
      "Ethical considerations",
      "Analysis approach",
    ],
  },
  {
    id: "research-chapter",
    name: "Dissertation / Thesis Chapter",
    price: 3500,
    priceLabel: "From",
    currency: "NAD",
    description: "One full chapter (e.g. results, discussion, or findings).",
    includes: [
      "Chapter structure per institution",
      "Citations & cross-references",
      "Tables / figures as scoped",
      "Supervisor revision support",
    ],
  },
  {
    id: "research-data-analysis",
    name: "Data Analysis & Results Chapter",
    price: 2000,
    priceLabel: "From",
    currency: "NAD",
    description: "Statistical or qualitative analysis with results write-up.",
    includes: [
      "SPSS / Excel analysis (as scoped)",
      "Tables, charts & interpretation",
      "Results chapter narrative",
      "Appendix outputs",
    ],
  },
  {
    id: "research-full",
    name: "Full Thesis / Dissertation Support",
    price: 8500,
    priceLabel: "From",
    currency: "NAD",
    description: "End-to-end support for full research project (scoped by level & word count).",
    includes: [
      "All chapters from proposal to conclusion",
      "Milestone-based delivery",
      "Supervisor feedback revisions",
      "Final formatting & submission pack",
    ],
  },
];

export const BUSINESS_DOCUMENT_PACKAGES: BusinessPackage[] = [
  {
    id: "business-plan",
    name: "Business Plan",
    price: 3500,
    currency: "NAD",
    description:
      "Professional business plan for funding, tenders, or internal strategy—including financial projections guidance.",
    includes: [
      "Executive summary & company overview",
      "Market & competitor analysis",
      "Operations & management plan",
      "Financial forecasts section",
      "Editable document delivery",
    ],
  },
  {
    id: "business-proposal",
    name: "Business Proposal",
    price: 1200,
    priceLabel: "From",
    currency: "NAD",
    description:
      "Persuasive proposals for clients, partners, or grant applications—scoped to your project size.",
    includes: [
      "Cover letter & project scope",
      "Timeline & deliverables",
      "Pricing / budget section",
      "Professional formatting & branding alignment",
    ],
  },
];

export const BUSINESS_BRANDING_SERVICES = [
  "Logo design for your business identity",
  "Flyer & poster design (print-ready artwork)",
  "Business website design & development",
] as const;

/** Live products built by Skyrapay Consultations CC */
export type DevelopedAppType = "website" | "web-app" | "platform";

export type DevelopedAppLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type DevelopedApp = {
  id: string;
  name: string;
  description: string;
  type: DevelopedAppType;
  href: string;
  external?: boolean;
  highlights: string[];
  featured?: boolean;
  /** Additional entry points (e.g. individual portals) */
  accessLinks?: DevelopedAppLink[];
};

export const DEVELOPED_APPLICATIONS: DevelopedApp[] = [
  {
    id: "skyrapay-corporate-website",
    name: "Skyrapay Consultations Website",
    description:
      "Our corporate site—services, business registration packages, shop, and contact. Built with a modern responsive design and integrated with our product portfolio.",
    type: "website",
    href: "/",
    highlights: [
      "Services & NAD pricing",
      "Contact & business hours",
      "Shop & quote requests",
    ],
  },
  {
    id: "meyfield-college-website",
    name: "Meyfield College — Public Website",
    description:
      "Official college website for Meyfield College, Ondangwa—programmes, admissions, news, gallery, vacancies, and online application. Built for prospective students and the public.",
    type: "website",
    href: "https://www.meyfieldcollege.org/",
    external: true,
    highlights: [
      "Courses & admissions",
      "Online application (June intake)",
      "News, gallery & contact",
    ],
    accessLinks: [
      { label: "Visit website", href: "https://www.meyfieldcollege.org/", external: true },
      { label: "Apply online", href: "https://www.meyfieldcollege.org/", external: true },
    ],
  },
  {
    id: "meyfield-college-ums",
    name: "Meyfield College — University Management System",
    description:
      "Secure online portal for Meyfield College staff and students—role-based login for Admin, Lecturer, Student, Registrar, Finance, HR, and IT.",
    type: "web-app",
    href: "https://onlinem.meyfieldcollege.org/login.php",
    external: true,
    highlights: [
      "Multi-role authentication",
      "Student & lecturer workflows",
      "Registrar, finance & HR modules",
    ],
    accessLinks: [
      {
        label: "Staff & student login",
        href: "https://onlinem.meyfieldcollege.org/login.php",
        external: true,
      },
    ],
  },
  {
    id: "smartcampus-360",
    name: "SmartCampus 360 ERP",
    description:
      "Next-generation multi-tenant university ERP — AI student success, finance, LMS, CRM, research, digital verification, and executive analytics for Southern African institutions.",
    type: "platform",
    href: "/campus",
    featured: true,
    highlights: [
      "AI at-risk student prediction",
      "Multi-institution white-label SaaS",
      "Digital wallet & transcript verification",
    ],
    accessLinks: [
      { label: "Sign in to demo", href: "/campus/login" },
      { label: "Product overview", href: "/campus" },
      { label: "Transcript verification (public)", href: "/campus/acacia-college/verify" },
    ],
  },
  {
    id: "skyrapay-research-suite",
    name: "Skyrapay Research Suite",
    description:
      "Multi-portal AI research platform for students, institutions, analysts, and developers. Writing, literature, AI detection, topics, and curriculum tools.",
    type: "platform",
    href: "/research",
    featured: true,
    highlights: [
      "AI academic writing & citations",
      "AI detection & plagiarism tools",
      "Research topics & knowledge library",
    ],
    accessLinks: [
      { label: "Portal hub", href: "/research" },
      { label: "Student portal", href: "/student" },
      { label: "Institution portal", href: "/institution" },
      { label: "Analysis portal", href: "/analysis" },
      { label: "Developer console", href: "/developer" },
      { label: "Sign in", href: "/login" },
      { label: "Download apps", href: "/download" },
    ],
  },
];

export const SHOP_PACKAGES: ShopPackage[] = [
  {
    id: "starter-website",
    name: "Starter Website",
    priceLabel: "From",
    priceFrom: 499,
    currency: "USD",
    description: "Professional online presence for small businesses and professionals.",
    icon: Laptop,
    timeline: "2–3 weeks",
    features: [
      "Up to 5 pages",
      "Mobile-responsive design",
      "Contact form & Google Maps",
      "Basic SEO setup",
      "1 month post-launch support",
    ],
  },
  {
    id: "business-website",
    name: "Business Website",
    priceLabel: "From",
    priceFrom: 1299,
    currency: "USD",
    description: "Full corporate site with CMS, blog, and conversion-focused layout.",
    icon: Globe,
    timeline: "4–6 weeks",
    popular: true,
    features: [
      "Up to 15 pages + blog",
      "Content management system",
      "Brand-aligned custom design",
      "Analytics & performance tuning",
      "3 months support",
    ],
  },
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    priceLabel: "From",
    priceFrom: 2499,
    currency: "USD",
    description: "Sell products online with secure payments and inventory management.",
    icon: ShoppingBag,
    timeline: "6–10 weeks",
    features: [
      "Product catalogue & cart",
      "Payment gateway integration",
      "Order & customer management",
      "Shipping & tax configuration",
      "Staff training included",
    ],
  },
  {
    id: "web-app",
    name: "Custom Web Application",
    priceLabel: "From",
    priceFrom: 4999,
    currency: "USD",
    description: "Portals, dashboards, and bespoke tools—like our Skyrapay Research Suite platform.",
    icon: Server,
    timeline: "Scoped per project",
    features: [
      "Custom features & user roles",
      "API & database design",
      "Authentication & subscriptions",
      "Deployment & DevOps",
      "Ongoing maintenance plans",
    ],
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    priceLabel: "From",
    priceFrom: 5999,
    currency: "USD",
    description: "Native or cross-platform apps for iOS and Android.",
    icon: Smartphone,
    timeline: "8–14 weeks",
    features: [
      "UI/UX design & prototyping",
      "iOS and/or Android build",
      "App store submission support",
      "Push notifications",
      "Backend API if required",
    ],
  },
  {
    id: "care-plan",
    name: "Website Care Plan",
    priceLabel: "From",
    priceFrom: 99,
    currency: "USD",
    description: "Monthly maintenance, updates, backups, and security monitoring.",
    icon: Headphones,
    timeline: "Ongoing monthly",
    features: [
      "Security & plugin updates",
      "Uptime monitoring",
      "Content updates (fair use)",
      "Monthly performance report",
      "Priority support",
    ],
  },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/hosting", label: "Hosting" },
  { href: "/shop", label: "Shop" },
  { href: "/shop#our-apps", label: "Our apps" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
