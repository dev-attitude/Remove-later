import type { LucideIcon } from "lucide-react";
import {
  Monitor,
  Briefcase,
  Smartphone,
  Server,
  Globe,
  Laptop,
  ShoppingBag,
  Headphones,
} from "lucide-react";

export const COMPANY = {
  name: "GM Consultations",
  tagline: "Expert Solutions for Success",
  email: "info@gmconsultations.com",
  phone: "+264 81 000 0000",
  location: "Windhoek, Namibia",
  researchAppPath: "/research",
} as const;

export type ServiceSlug =
  | "it-consulting"
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
    title: "IT Consultations",
    short: "Strategy, infrastructure, and digital transformation for modern organisations.",
    description:
      "We assess your technology landscape, recommend secure and scalable solutions, and guide implementation—from cloud migration to cybersecurity and IT governance.",
    icon: Monitor,
    features: [
      "IT audits & technology roadmaps",
      "Cloud & infrastructure planning",
      "Cybersecurity assessments",
      "Vendor selection & procurement support",
      "Staff training & change management",
    ],
    deliverables: [
      "Written assessment report",
      "Prioritised action plan",
      "Implementation timeline",
      "Ongoing advisory (optional retainer)",
    ],
  },
  {
    slug: "business-consulting",
    title: "Business Consultation Services",
    short: "Operational excellence, growth strategy, and process optimisation.",
    description:
      "GM Consultations partners with SMEs and institutions to clarify goals, streamline operations, and build sustainable growth through data-informed business planning.",
    icon: Briefcase,
    features: [
      "Business planning & feasibility studies",
      "Process mapping & optimisation",
      "Market research & positioning",
      "Financial modelling support",
      "Compliance & policy frameworks",
    ],
    deliverables: [
      "Business plan or strategy document",
      "KPI dashboards & reporting templates",
      "Workshop facilitation",
      "Quarterly review sessions",
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
    description: "Portals, dashboards, and bespoke tools—like our Research Suite platform.",
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
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
