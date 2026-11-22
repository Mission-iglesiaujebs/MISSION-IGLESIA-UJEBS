"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getSessionProfile, createClient } from "@/lib/supabase/server";
import { getModule, canCreate, canWrite } from "@/lib/modules";
import { roles, type Role } from "@/config/site";

// ---------- Autenticación (solo correo + contraseña, sin MFA) ----------
export async function signIn(lang: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/${lang}/login?error=1`);
  redirect(`/${lang}/panel`);
}

function origin() {
  const h = headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

export async function signUp(lang: string, formData: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      data: { full_name: String(formData.get("full_name") ?? "") },
      emailRedirectTo: `${origin()}/${lang}/auth/callback`,
    },
  });
  if (error) redirect(`/${lang}/login?mode=signup&error=1`);
  if (data.session) redirect(`/${lang}/panel`);
  redirect(`/${lang}/login?created=1`);
}

export async function forgotPassword(lang: string, formData: FormData) {
  const supabase = createClient();
  const next = encodeURIComponent(`/${lang}/panel/perfil?reset=1`);
  await supabase.auth.resetPasswordForEmail(String(formData.get("email")), {
    redirectTo: `${origin()}/${lang}/auth/callback?next=${next}`,
  });
  // Siempre el mismo mensaje: no revela si el correo existe
  redirect(`/${lang}/login?mode=forgot&sent=1`);
}

export async function updateName(lang: string, formData: FormData) {
  const supabase = createClient();
  await supabase.rpc("update_my_name", { new_name: String(formData.get("full_name") ?? "").trim() });
  revalidatePath(`/${lang}/panel`, "layout");
  redirect(`/${lang}/panel/perfil?name=1`);
}

export async function changePassword(lang: string, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password !== String(formData.get("confirm") ?? "")) {
    redirect(`/${lang}/panel/perfil?pwerr=1`);
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  redirect(`/${lang}/panel/perfil?${error ? "pwerr=1" : "pw=1"}`);
}

export async function signOut(lang: string) {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}

// ---------- CRUD genérico de módulos ----------
function readForm(mod: NonNullable<ReturnType<typeof getModule>>, formData: FormData, writer: boolean) {
  const row: Record<string, unknown> = {};
  for (const f of mod.fields) {
    // un miembro común no puede fijar el estado de su petición
    if (!writer && f.key === "status") continue;
    const raw = formData.get(f.key);
    if (f.type === "bool") row[f.key] = raw === "on";
    else if (raw === null) continue;
    else if (raw === "") row[f.key] = null;
    else if (f.type === "number") row[f.key] = Number(raw);
    else if (f.type === "datetime") row[f.key] = new Date(String(raw)).toISOString();
    else row[f.key] = String(raw);
  }
  // vacíos → valor por defecto de la base al crear
  return row;
}

export async function createRecord(lang: string, moduleKey: string, formData: FormData) {
  const mod = getModule(moduleKey);
  const { supabase, user, profile } = await getSessionProfile();
  if (!mod || !user || !canCreate(mod, profile?.role ?? null)) return;
  const row = readForm(mod, formData, canWrite(mod, profile?.role ?? null));
  for (const k of Object.keys(row)) if (row[k] === null) delete row[k];
  row.created_by = user.id;
  const { error } = await supabase.from(mod.table).insert(row);
  if (error) redirect(`/${lang}/panel/${moduleKey}?error=1`);
  revalidatePath(`/${lang}/panel/${moduleKey}`);
  redirect(`/${lang}/panel/${moduleKey}?ok=1`);
}

export async function updateRecord(lang: string, moduleKey: string, id: string, formData: FormData) {
  const mod = getModule(moduleKey);
  const { supabase, profile } = await getSessionProfile();
  if (!mod || !canWrite(mod, profile?.role ?? null)) return;
  const row = readForm(mod, formData, true);
  const { error } = await supabase.from(mod.table).update(row).eq("id", id);
  if (error) redirect(`/${lang}/panel/${moduleKey}/${id}?error=1`);
  revalidatePath(`/${lang}/panel/${moduleKey}`);
  redirect(`/${lang}/panel/${moduleKey}?ok=1`);
}

export async function deleteRecord(lang: string, moduleKey: string, id: string) {
  const mod = getModule(moduleKey);
  const { supabase, profile } = await getSessionProfile();
  if (!mod || !canWrite(mod, profile?.role ?? null)) return;
  await supabase.from(mod.table).delete().eq("id", id);
  revalidatePath(`/${lang}/panel/${moduleKey}`);
}

// ---------- Roles y sede (solo admin) ----------
export async function setRole(lang: string, userId: string, formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;
  const role = String(formData.get("role")) as Role;
  if (!roles.includes(role)) return;
  const site = String(formData.get("site_id") ?? "");
  // un admin de sede solo puede asignar su propia sede
  const site_id = profile.site_id ?? (site || null);
  await supabase.from("profiles").update({ role, site_id }).eq("id", userId);
  revalidatePath(`/${lang}/panel/usuarios`);
}
