import type { SupabaseClient } from "@supabase/supabase-js";
import { AREAS, SYSTEMS, type L5, type SysField, type SysFieldType, type SysModule } from "@/lib/catalog";
import type { Profile } from "@/lib/supabase/server";

export type CatArea = { key: string; icon: string; label: L5; custom: boolean; hidden: boolean };
const TYPES: SysFieldType[] = ["text", "textarea", "number", "date", "datetime", "bool", "select", "url", "email"];

// Valida los campos guardados en la base (vienen de formularios de administradores)
export function cleanFields(raw: unknown): SysField[] {
  if (!Array.isArray(raw)) return [];
  const out: SysField[] = [];
  for (const f of raw.slice(0, 30)) {
    if (!f || typeof f !== "object") continue;
    const { key, type, label, options } = f as Record<string, unknown>;
    if (typeof key !== "string" || !/^[a-z][a-z0-9_]{0,40}$/.test(key)) continue;
    if (typeof type !== "string" || !TYPES.includes(type as SysFieldType)) continue;
    if (out.some((o) => o.key === key)) continue;
    const opts = Array.isArray(options) ? options.filter((o): o is string => typeof o === "string").map((o) => o.slice(0, 60)).slice(0, 30) : undefined;
    if (type === "select" && (!opts || opts.length === 0)) continue;
    out.push({ key, type: type as SysFieldType, label: typeof label === "string" ? label.slice(0, 80) : undefined, options: opts });
  }
  return out;
}
const asL5 = (v: unknown, fallback: L5): L5 =>
  Array.isArray(v) && v.length === 5 && v.every((x) => typeof x === "string") ? (v as L5) : fallback;

// Catálogo efectivo = 300 sistemas incluidos + los creados/editados/ocultados desde el panel
export async function getCatalog(supabase: SupabaseClient, profile: Profile | null) {
  const [ad, md, acc, rp] = await Promise.all([
    supabase.from("area_defs").select("key,icon,labels,hidden"),
    supabase.from("module_defs").select("key,area,icon,labels,fields,site_id,hidden"),
    supabase.from("area_access").select("area,read_roles,write_roles"),
    profile?.custom_role_id
      ? supabase.from("role_area_perms").select("area,can_read,can_write").eq("role_id", profile.custom_role_id)
      : Promise.resolve({ data: null }),
  ]);

  const areas = new Map<string, CatArea>(AREAS.map((a) => [a.key, { key: a.key, icon: a.icon, label: a.label, custom: false, hidden: false }]));
  for (const d of (ad.data ?? []) as { key: string; icon: string; labels: unknown; hidden: boolean }[]) {
    const base = areas.get(d.key);
    areas.set(d.key, { key: d.key, icon: d.icon || base?.icon || "📁", label: asL5(d.labels, base?.label ?? [d.key, d.key, d.key, d.key, d.key]), custom: !base, hidden: d.hidden });
  }

  const systems = new Map<string, SysModule>(SYSTEMS.map((s) => [s.key, { ...s, custom: false, hidden: false, siteId: null }]));
  for (const m of (md.data ?? []) as { key: string; area: string; icon: string; labels: unknown; fields: unknown; site_id: string | null; hidden: boolean }[]) {
    const base = systems.get(m.key);
    const fields = cleanFields(m.fields);
    systems.set(m.key, {
      key: m.key, area: m.area, icon: m.icon || base?.icon || "📄",
      labels: asL5(m.labels, base?.labels ?? [m.key, m.key, m.key, m.key, m.key]),
      fields: fields.length ? fields : base?.fields ?? [],
      custom: !SYSTEMS.some((s) => s.key === m.key), hidden: m.hidden, siteId: m.site_id,
    });
  }

  // Permisos: con rol personalizado manda su tabla; si no, el rol base (igual que la base de datos)
  const perms = new Map<string, { r: boolean; w: boolean }>();
  if (rp.data) {
    for (const p of rp.data as { area: string; can_read: boolean; can_write: boolean }[]) perms.set(p.area, { r: p.can_read, w: p.can_write });
  } else if (profile) {
    for (const a of (acc.data ?? []) as { area: string; read_roles: string[]; write_roles: string[] }[]) {
      perms.set(a.area, { r: a.read_roles.includes(profile.role), w: a.write_roles.includes(profile.role) });
    }
  }
  const canRead = (area: string) => !!perms.get(area)?.r;
  const canWrite = (area: string) => !!perms.get(area)?.w;

  const allAreas = Array.from(areas.values());
  const allSystems = Array.from(systems.values());
  const visibleAreas = allAreas.filter((a) => !a.hidden);
  const visibleSystems = allSystems.filter((s) => !s.hidden && !areas.get(s.area)?.hidden && areas.has(s.area));
  return {
    allAreas, allSystems, areas: visibleAreas, systems: visibleSystems,
    getSystem: (key: string) => visibleSystems.find((s) => s.key === key),
    getArea: (key: string) => areas.get(key),
    canRead, canWrite,
    builtinSystem: (key: string) => SYSTEMS.some((s) => s.key === key),
    builtinArea: (key: string) => AREAS.some((a) => a.key === key),
  };
}
export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
