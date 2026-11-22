"use client";

import { useEffect, useState } from "react";
import type { PwaText } from "@/lib/pwa-i18n";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Botón "Instalar app": usa el instalador nativo en Android/Chrome y muestra instrucciones en iPhone.
export function InstallApp({ t, variant = "header" }: { t: PwaText; variant?: "header" | "card" }) {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as PromptEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const click = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPrompt(null);
    } else {
      setOpen(true);
    }
  };

  if (variant === "header" && installed) return null;

  const button = variant === "header" ? (
    <button onClick={click} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold ring-1 ring-brand-gold/60 hover:bg-white/10" aria-label={t.install}>
      📱 <span className="hidden md:inline">{t.install}</span>
    </button>
  ) : (
    <div className="flex items-start gap-3">
      <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
      <div>
        <p className="font-semibold text-white">{t.title}</p>
        <p className="mt-1 text-slate-400">{t.desc}</p>
        {installed ? <p className="mt-2 text-emerald-400">{t.installed}</p> : (
          <button onClick={click} className="mt-3 rounded-lg bg-brand-gold px-4 py-2 font-semibold text-brand">📱 {t.install}</button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {button}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
              <p className="text-lg font-bold">{t.title}</p>
            </div>
            <p className="text-sm text-slate-600">{t.desc}</p>
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">🍎 {t.ios}</p>
            <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">🤖 {t.android}</p>
            <button onClick={() => setOpen(false)} className="btn mt-5 w-full">{t.close}</button>
          </div>
        </div>
      )}
    </>
  );
}
