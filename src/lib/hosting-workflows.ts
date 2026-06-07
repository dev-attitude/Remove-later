/** Skyrapay Hosting provisioning steps (manage / demo dashboard) */

export type HostingStep = {
  stepKey: string;
  title: string;
  durationNote?: string;
};

export type HostingWorkflow = {
  packageId: string;
  label: string;
  steps: HostingStep[];
};

const STANDARD_PROVISIONING: HostingStep[] = [
  { stepKey: "order_received", title: "Order received & payment confirmed" },
  { stepKey: "domain_registered", title: "Domain registered / transferred", durationNote: "1–2 days" },
  { stepKey: "cpanel_created", title: "cPanel hosting account created" },
  { stepKey: "dns_configured", title: "DNS records configured" },
  { stepKey: "ssl_installed", title: "SSL certificate installed (AutoSSL)" },
  { stepKey: "email_ready", title: "Email accounts created & tested" },
  { stepKey: "handover", title: "Login details sent to client" },
];

export const HOSTING_WORKFLOWS: HostingWorkflow[] = [
  { packageId: "hosting-starter", label: "Starter Hosting", steps: STANDARD_PROVISIONING },
  { packageId: "hosting-business", label: "Business Hosting", steps: STANDARD_PROVISIONING },
  { packageId: "hosting-premium", label: "Premium Hosting", steps: STANDARD_PROVISIONING },
  { packageId: "hosting-domain", label: "Domain Registration", steps: [
    { stepKey: "order_received", title: "Order received" },
    { stepKey: "domain_registered", title: "Domain registered", durationNote: "1–2 days" },
    { stepKey: "dns_configured", title: "DNS zone created" },
    { stepKey: "handover", title: "Domain management access sent" },
  ]},
];

export function getHostingWorkflow(packageId: string): HostingWorkflow | undefined {
  return HOSTING_WORKFLOWS.find((w) => w.packageId === packageId);
}
