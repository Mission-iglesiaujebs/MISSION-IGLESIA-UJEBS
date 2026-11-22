"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSessionProfile, isGlobal } from "@/lib/supabase/server";
import { roles, type Role } from "@/config/site";
import { SYSTEMS, AREAS, VOCAB, type SysField, type SysFieldType } from "@/lib/catalog";
import { cleanFields } from "@/lib/catalog-db";

const LANGS = ["es", "fr", "ht", "en", "pt"] as const;
const IMG: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const orNull = (v: string) => (v === "" ? null : v);
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

const slug = (s: string, max = 30) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "").slice(0, max);

// Sube una imagen al almacenamiento "media". Devuelve la ruta o null si no hay archivo; "error" si no es válido.
async function uploadImage(supabase: SupabaseClient, file: FormDataEntryValue | null, folder: string): Promise<string | null | "error"> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const ext = IMG[file.type];
  if (!ext || file.size > 3 * 1024 * 1024) return "error";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  return error ? "error" : path;
}

// ---------------- Configuración general ----------------
export async function saveSettings(lang: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (!isGlobal(profile) || !["admin", "pastor"].includes(profile!.role)) redirect(`/${lang}/panel/configuracion?error=1`);
  const color = (k: string) => (/^#[0-9a-fA-F]{6}$/.test(str(fd, k)) ? str(fd, k) : null);
  const patch: Record<string, unknown> = {
    name: orNull(str(fd, "name", 160)), short_name: orNull(str(fd, "short_name", 40)), tagline: orNull(str(fd, "tagline")),
    verse: orNull(str(fd, "verse", 120)), primary_color: color("primary_color"), accent_color: color("accent_color"),
    email: orNull(str(fd, "email", 200)), phone: orNull(str(fd, "phone", 60)), address: orNull(str(fd, "address")),
    youtube: orNull(str(fd, "youtube")), facebook: orNull(str(fd, "facebook")), instagram: orNull(str(fd, "instagram")),
    whatsapp: orNull(str(fd, "whatsapp", 60)), live_url: orNull(str(fd, "live_url")), updated_at: new Date().toISOString(),
  };
  const logo = await uploadImage(supabase, fd.get("logo"), "branding");
  if (logo === "error") redirect(`/${lang}/panel/configuracion?error=1`);
  if (logo) patch.logo_path = logo;
  if (fd.get("remove_logo") === "on") patch.logo_path = null;
  const { error } = await supabase.from("settings").update(patch).eq("id", 1);
  revalidatePath("/", "layout");
  redirect(`/${lang}/panel/configuracion?${error ? "error" : "ok"}=1`);
}

// ---------------- Mi perfil: nombre, teléfono y foto ----------------
export async function saveProfile(lang: string, fd: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  let avatar: string | null = null;
  const up = await uploadImage(supabase, fd.get("avatar"), `avatars/${user!.id}`);
  if (up === "error") redirect(`/${lang}/panel/perfil?photoerr=1`);
  if (up) avatar = up;
  if (fd.get("remove_avatar") === "on") avatar = "";
  const { error } = await supabase.rpc("update_my_profile", { new_name: str(fd, "full_name", 120), new_phone: str(fd, "phone", 60), new_avatar: avatar });
  revalidatePath(`/${lang}/panel`, "layout");
  redirect(`/${lang}/panel/perfil?${error ? "photoerr" : "name"}=1`);
}

// ---------------- Roles personalizados ----------------
export async function createRole(lang: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;
  const base = str(fd, "base_role") as Role;
  const site = str(fd, "site_id");
  const { data, error } = await supabase.from("custom_roles").insert({
    name: str(fd, "name", 80), description: orNull(str(fd, "description", 500)),
    base_role: roles.includes(base) ? base : "miembro",
    site_id: profile.site_id ?? (isUuid(site) ? site : null),
  }).select("id").single();
  revalidatePath(`/${lang}/panel/roles`);
  redirect(error || !data ? `/${lang}/panel/roles?error=1` : `/${lang}/panel/roles/${data.id}`);
}

export async function saveRolePerms(lang: string, roleId: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin" || !isUuid(roleId)) return;
  const areas = String(fd.get("areas") ?? "").split(",").filter((a) => /^[a-z][a-z0-9_]{1,30}$/.test(a)).slice(0, 200);
  const rows = areas.map((area) => {
    const w = fd.get(`w_${area}`) === "on";
    return { role_id: roleId, area, can_read: w || fd.get(`r_${area}`) === "on", can_write: w };
  }).filter((r) => r.can_read);
  const base = str(fd, "base_role") as Role;
  await supabase.from("custom_roles").update({
    name: str(fd, "name", 80) || undefined, description: orNull(str(fd, "description", 500)),
    ...(roles.includes(base) ? { base_role: base } : {}),
  }).eq("id", roleId);
  await supabase.from("role_area_perms").delete().eq("role_id", roleId);
  const { error } = rows.length ? await supabase.from("role_area_perms").insert(rows) : { error: null };
  // los usuarios con este rol heredan el nuevo nivel base
  if (roles.includes(base)) await supabase.from("profiles").update({ role: base }).eq("custom_role_id", roleId);
  revalidatePath(`/${lang}/panel`, "layout");
  redirect(`/${lang}/panel/roles/${roleId}?${error ? "error" : "ok"}=1`);
}

export async function deleteRole(lang: string, roleId: string) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin" || !isUuid(roleId)) return;
  await supabase.from("custom_roles").delete().eq("id", roleId);
  revalidatePath(`/${lang}/panel/roles`);
  redirect(`/${lang}/panel/roles`);
}

// Rol base, rol personalizado, iglesia y región de un usuario
export async function setUserAccess(lang: string, userId: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin" || !isUuid(userId)) return;
  let role = str(fd, "role") as Role;
  if (!roles.includes(role)) return;
  const customId = str(fd, "custom_role_id");
  let custom_role_id: string | null = null;
  if (isUuid(customId)) {
    const { data: cr } = await supabase.from("custom_roles").select("id, base_role").eq("id", customId).maybeSingle();
    if (cr) { custom_role_id = cr.id; role = cr.base_role as Role; }
  }
  const patch: Record<string, unknown> = { role, custom_role_id };
  if (!profile.site_id) {
    const site = str(fd, "site_id");
    patch.site_id = isUuid(site) ? site : null;
    if (isGlobal(profile)) {
      const region = str(fd, "region_id");
      patch.region_id = isUuid(region) && !patch.site_id ? region : null;
    } else if (!patch.site_id) {
      return; // un admin regional no puede crear cuentas generales
    }
  }
  await supabase.from("profiles").update(patch).eq("id", userId);
  revalidatePath(`/${lang}/panel/usuarios`);
}

// ---------------- Ministerios (áreas) y sistemas reutilizables ----------------
function readLabels(fd: FormData, prefix: string): string[] {
  const es = str(fd, `${prefix}_es`, 80);
  return LANGS.map((l) => str(fd, `${prefix}_${l}`, 80) || es);
}

export async function saveArea(lang: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (!isGlobal(profile) || profile!.role !== "admin") redirect(`/${lang}/panel/sistemas/gestionar?error=1`);
  const labels = readLabels(fd, "name");
  if (!labels[0]) redirect(`/${lang}/panel/sistemas/gestionar?error=1`);
  let key = str(fd, "key", 31);
  const isNew = !key;
  if (isNew) {
    key = slug(labels[0]) || "area";
    if (key.length < 2) key = `area_${key}`;
    if (AREAS.some((a) => a.key === key)) key = `${key}_${Math.random().toString(36).slice(2, 5)}`.slice(0, 31);
  }
  const { error } = await supabase.from("area_defs").upsert({ key, icon: str(fd, "icon", 16) || "📁", labels, hidden: false });
  // permisos iniciales de un ministerio nuevo: ven todos, editan líderes
  if (!error && isNew) {
    await supabase.from("area_access").upsert({ area: key, read_roles: ["miembro", "lider", "secretaria", "tesorero", "pastor", "admin"], write_roles: ["lider", "secretaria", "pastor", "admin"] }, { onConflict: "area", ignoreDuplicates: true });
  }
  revalidatePath(`/${lang}/panel`, "layout");
  redirect(`/${lang}/panel/sistemas/gestionar?${error ? "error" : "ok"}=1`);
}

export async function toggleArea(lang: string, key: string, hidden: boolean) {
  const { supabase, profile } = await getSessionProfile();
  if (!isGlobal(profile) || profile!.role !== "admin") return;
  const base = AREAS.find((a) => a.key === key);
  const { data: cur } = await supabase.from("area_defs").select("key").eq("key", key).maybeSingle();
  if (cur) await supabase.from("area_defs").update({ hidden }).eq("key", key);
  else if (base) await supabase.from("area_defs").insert({ key, icon: base.icon, labels: base.label, hidden });
  revalidatePath(`/${lang}/panel`, "layout");
}

function readFields(fd: FormData): SysField[] {
  const std = new Set(fd.getAll("std").map(String));
  const fields: SysField[] = VOCAB.filter((v) => std.has(v.key)).map((v) => ({ key: v.key, type: v.type, options: v.options }));
  for (let i = 0; i < 12; i++) {
    const label = str(fd, `cf_label_${i}`, 80);
    if (!label) continue;
    const type = str(fd, `cf_type_${i}`) as SysFieldType;
    const options = str(fd, `cf_opts_${i}`, 1000).split(",").map((o) => o.trim()).filter(Boolean).slice(0, 30);
    const key = str(fd, `cf_key_${i}`, 41) || `c_${slug(label, 30) || "campo"}`;
    fields.push({ key, type: type === "select" && options.length === 0 ? "text" : type, label, options: type === "select" ? options : undefined });
  }
  return cleanFields(fields);
}

export async function saveModule(lang: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin") redirect(`/${lang}/panel/sistemas/gestionar?error=1`);
  const labels = readLabels(fd, "name");
  const area = str(fd, "area", 31);
  const fields = readFields(fd);
  if (!labels[0] || !/^[a-z][a-z0-9_]{1,30}$/.test(area) || fields.length === 0) redirect(`/${lang}/panel/sistemas/gestionar?error=1`);
  let key = str(fd, "key", 72);
  const editingBuiltin = SYSTEMS.some((s) => s.key === key);
  if (!key || !key.startsWith(`${area}.`)) {
    key = `${area}.${slug(labels[0], 28) || "sistema"}_${Math.random().toString(36).slice(2, 6)}`;
  }
  if (editingBuiltin && profile!.site_id) redirect(`/${lang}/panel/sistemas/gestionar?error=1`);
  const site_id = profile!.site_id ?? null; // una iglesia crea sistemas solo para ella
  const { error } = await supabase.from("module_defs").upsert({ key, area, icon: str(fd, "icon", 16) || "📄", labels, fields, site_id, hidden: false });
  revalidatePath(`/${lang}/panel`, "layout");
  redirect(error ? `/${lang}/panel/sistemas/gestionar?error=1` : `/${lang}/panel/sistemas/${key}?ok=1`);
}

export async function toggleModule(lang: string, key: string, hidden: boolean) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;
  const { data: cur } = await supabase.from("module_defs").select("key").eq("key", key).maybeSingle();
  const base = SYSTEMS.find((s) => s.key === key);
  if (cur) await supabase.from("module_defs").update({ hidden }).eq("key", key);
  else if (base) await supabase.from("module_defs").insert({ key, area: base.area, icon: base.icon, labels: base.labels, fields: base.fields, hidden });
  revalidatePath(`/${lang}/panel`, "layout");
}

export async function deleteModule(lang: string, key: string) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;
  if (SYSTEMS.some((s) => s.key === key)) return toggleModule(lang, key, true); // los incluidos se ocultan
  await supabase.from("module_defs").delete().eq("key", key);
  revalidatePath(`/${lang}/panel`, "layout");
}

// ---------------- Página pública de cada iglesia ----------------
export async function saveChurch(lang: string, siteId: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (!profile || !["secretaria", "pastor", "admin"].includes(profile.role) || !isUuid(siteId)) return;
  const patch: Record<string, unknown> = {
    about: orNull(str(fd, "about", 5000)), email: orNull(str(fd, "email", 200)), phone: orNull(str(fd, "phone", 60)),
    address: orNull(str(fd, "address")), schedule: orNull(str(fd, "schedule")), pastor_name: orNull(str(fd, "pastor_name", 120)),
    youtube: orNull(str(fd, "youtube")), facebook: orNull(str(fd, "facebook")), instagram: orNull(str(fd, "instagram")),
    whatsapp: orNull(str(fd, "whatsapp", 60)), published: fd.get("published") === "on",
  };
  const region = str(fd, "region_id");
  if (isGlobal(profile)) patch.region_id = isUuid(region) ? region : null;
  const logo = await uploadImage(supabase, fd.get("logo"), "branding");
  const cover = await uploadImage(supabase, fd.get("cover"), "branding");
  if (logo === "error" || cover === "error") redirect(`/${lang}/panel/iglesia?id=${siteId}&error=1`);
  if (logo) patch.logo_path = logo;
  if (cover) patch.cover_path = cover;
  const { error } = await supabase.from("sites").update(patch).eq("id", siteId);
  revalidatePath(`/${lang}`, "layout");
  redirect(`/${lang}/panel/iglesia?id=${siteId}&${error ? "error" : "ok"}=1`);
}
