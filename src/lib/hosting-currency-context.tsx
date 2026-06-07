"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_OVERRIDE_COOKIE,
  formatNadAsCurrency,
  getCurrencyForCountry,
  HOSTING_BASE_CURRENCY,
  isSupportedCurrency,
  type HostingCurrency,
} from "@/lib/hosting-currency";

type HostingCurrencyContextValue = {
  country: string;
  currency: HostingCurrency;
  isConverted: boolean;
  formatPrice: (amountNad: number, suffix?: string) => string;
  setCurrency: (currency: HostingCurrency) => void;
};

const HostingCurrencyContext = createContext<HostingCurrencyContextValue | null>(null);

function readOverrideCookie(): HostingCurrency | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CURRENCY_OVERRIDE_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split("=")[1] ?? "");
  return isSupportedCurrency(value) ? value : null;
}

function writeOverrideCookie(currency: HostingCurrency) {
  document.cookie = `${CURRENCY_OVERRIDE_COOKIE}=${currency};path=/;max-age=31536000;samesite=lax`;
}

export function HostingCurrencyProvider({
  initialCountry,
  children,
}: {
  initialCountry: string;
  children: ReactNode;
}) {
  const [country] = useState(initialCountry.toUpperCase());
  const [currency, setCurrencyState] = useState<HostingCurrency>(() =>
    getCurrencyForCountry(initialCountry)
  );

  useEffect(() => {
    const override = readOverrideCookie();
    if (override) setCurrencyState(override);
  }, []);

  const setCurrency = useCallback((next: HostingCurrency) => {
    setCurrencyState(next);
    writeOverrideCookie(next);
  }, []);

  const formatPrice = useCallback(
    (amountNad: number, suffix?: string) =>
      formatNadAsCurrency(amountNad, currency, suffix ? { suffix } : undefined),
    [currency]
  );

  const value = useMemo(
    () => ({
      country,
      currency,
      isConverted: currency !== HOSTING_BASE_CURRENCY,
      formatPrice,
      setCurrency,
    }),
    [country, currency, formatPrice, setCurrency]
  );

  return (
    <HostingCurrencyContext.Provider value={value}>{children}</HostingCurrencyContext.Provider>
  );
}

export function useHostingCurrency() {
  const ctx = useContext(HostingCurrencyContext);
  if (!ctx) {
    throw new Error("useHostingCurrency must be used within HostingCurrencyProvider");
  }
  return ctx;
}
