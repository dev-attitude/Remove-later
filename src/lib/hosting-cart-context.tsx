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
  HOSTING_CART_STORAGE_KEY,
  type HostingCartItem,
  computeCartTotals,
} from "@/lib/hosting-demo";

type HostingCartContextValue = {
  items: HostingCartItem[];
  addItem: (item: HostingCartItem) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  hasItem: (lineId: string) => boolean;
  itemCount: number;
  totals: ReturnType<typeof computeCartTotals>;
};

const HostingCartContext = createContext<HostingCartContextValue | null>(null);

function loadCart(): HostingCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HOSTING_CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HostingCartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: HostingCartItem[]) {
  localStorage.setItem(HOSTING_CART_STORAGE_KEY, JSON.stringify(items));
}

export function HostingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<HostingCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: HostingCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === item.lineId);
      if (existing) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const hasItem = useCallback(
    (lineId: string) => items.some((i) => i.lineId === lineId),
    [items]
  );

  const totals = useMemo(() => computeCartTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      hasItem,
      itemCount: items.length,
      totals,
    }),
    [items, addItem, removeItem, clearCart, hasItem, totals]
  );

  return (
    <HostingCartContext.Provider value={value}>{children}</HostingCartContext.Provider>
  );
}

export function useHostingCart() {
  const ctx = useContext(HostingCartContext);
  if (!ctx) throw new Error("useHostingCart must be used within HostingCartProvider");
  return ctx;
}
