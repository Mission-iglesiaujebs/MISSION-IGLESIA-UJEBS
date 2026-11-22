import { cache } from "react";
import { site as defaults } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export type Settings = {
  name: string; shortName: string; tagline: string | null; verse: string; logo: string | null;
  primary: string; accent: string; email: string; phone: string; address: string;
  youtube: string | null; facebook: string | null; instagram: string | null; whatsapp: string | null; liveUrl: string | null;
};

// URL pública de un archivo del bucket "media" (logo, portadas, fotos de perfil)
export const mediaUrl = (path: string | null | undefined) =>
  path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path.split("/").map(encodeURIComponent).join("/")}` : null;

// Configuración general de la misión (editable en Panel → Configuración). Una consulta por petición.
export const getSettings = cache(async (): Promise<Settings> => {
  let r: Record<string, string | null> = {};
  try {
    const { data } = await createClient().from("settings").select("*").eq("id", 1).maybeSingle();
    r = (data as Record<string, string | null>) ?? {};
  } catch { /* sin base de datos: valores por defecto */ }
  return {
    name: r.name || defaults.name,
    shortName: r.short_name || defaults.shortName,
    tagline: r.tagline || null,
    verse: r.verse || defaults.verse,
    logo: mediaUrl(r.logo_path),
    primary: r.primary_color || "#1e3a8a",
    accent: r.accent_color || "#c9a227",
    email: r.email || defaults.email,
    phone: r.phone || defaults.phone,
    address: r.address || defaults.address,
    youtube: r.youtube || null, facebook: r.facebook || null, instagram: r.instagram || null,
    whatsapp: r.whatsapp || null, liveUrl: r.live_url || null,
  };
});

// "#1e3a8a" → "30 58 138" (formato de las variables CSS de Tailwind)
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export function themeVars(s: Settings) {
  const p = rgb(/^#[0-9a-f]{6}$/i.test(s.primary) ? s.primary : "#1e3a8a");
  const a = rgb(/^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent : "#c9a227");
  const light = p.map((c) => Math.round(c + (255 - c) * 0.25));
  return { "--brand": p.join(" "), "--brand-light": light.join(" "), "--brand-gold": a.join(" ") } as React.CSSProperties;
}
