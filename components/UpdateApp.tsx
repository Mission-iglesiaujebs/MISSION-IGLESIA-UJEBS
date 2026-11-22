"use client";
import { useState } from "react";

// Busca la última versión publicada: actualiza el service worker, limpia la caché y recarga
export function UpdateApp({ labels }: { labels: { btn: string; busy: string; done: string } }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  async function run() {
    setState("busy");
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
        reg?.waiting?.postMessage("SKIP_WAITING");
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch { /* sin service worker: basta con recargar */ }
    setState("done");
    setTimeout(() => window.location.reload(), 800);
  }
  return (
    <button type="button" onClick={run} disabled={state === "busy"} className="btn disabled:opacity-60">
      {state === "busy" ? `⏳ ${labels.busy}` : state === "done" ? `✓ ${labels.done}` : `🔄 ${labels.btn}`}
    </button>
  );
}
