import { cookies, headers } from "next/headers";
import { HostingCurrencyProvider } from "@/lib/hosting-currency-context";
import {
  COUNTRY_COOKIE,
  detectCountryFromHeaders,
} from "@/lib/hosting-currency";

export default async function HostingLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const country = detectCountryFromHeaders(
    headerStore.get("x-vercel-ip-country") ?? headerStore.get("cf-ipcountry"),
    cookieStore.get(COUNTRY_COOKIE)?.value
  );

  return (
    <HostingCurrencyProvider initialCountry={country}>{children}</HostingCurrencyProvider>
  );
}
