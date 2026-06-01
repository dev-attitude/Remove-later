"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { COMPANY } from "@/lib/site-content";

const WHATSAPP_NUMBER = COMPANY.phone.replace(/\D/g, "");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  `Hello ${COMPANY.shortName}, I would like to chat about your services.`
)}`;

const TAWK_PROPERTY = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim();
const TAWK_WIDGET = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID?.trim();
const HAS_TAWK = Boolean(TAWK_PROPERTY && TAWK_WIDGET);

declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void;
      toggle?: () => void;
      hideWidget?: () => void;
      onLoad?: () => void;
    };
  }
}

export function LiveChat() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!HAS_TAWK || typeof window === "undefined") return;

    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      window.Tawk_API?.hideWidget?.();
    };
    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY}/${TAWK_WIDGET}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, []);

  function openLiveChat() {
    if (HAS_TAWK && window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
      setOpen(false);
      return;
    }
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[min(100vw-2.5rem,20rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          role="dialog"
          aria-label="Chat options"
        >
          <div className="marketing-chrome flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold text-white">Chat with us</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-white/90 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 p-3">
            <button
              type="button"
              onClick={openLiveChat}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-royal/30 hover:bg-brand-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-royal text-white">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-navy">
                  {HAS_TAWK ? "Live chat" : "WhatsApp chat"}
                </span>
                <span className="block text-xs text-slate-500">
                  {HAS_TAWK
                    ? "Talk to our team in real time"
                    : "Message us on WhatsApp — we reply during business hours"}
                </span>
              </span>
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition hover:bg-emerald-100"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-lg font-bold text-white">
                WA
              </span>
              <span>
                <span className="block text-sm font-semibold text-navy">WhatsApp</span>
                <span className="block text-xs text-slate-600">{COMPANY.phones[0]}</span>
              </span>
            </a>
            <p className="px-1 text-center text-[11px] text-slate-500">
              {COMPANY.businessHours.days}, {COMPANY.businessHours.time}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-royal text-white shadow-lg shadow-royal/30 transition hover:bg-sky hover:shadow-sky/30"
        aria-label={open ? "Close chat menu" : "Open chat"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
