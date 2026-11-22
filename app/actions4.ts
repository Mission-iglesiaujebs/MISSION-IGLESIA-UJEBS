"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/supabase/server";
import type { SysModule } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-db";

// ================= 200 SISTEMAS =================
function readSysForm(sys: SysModule, fd: FormData) {
  const data: Record<string, string | number | boolean> = {};
  for (const f of sys.fields) {
    const raw = fd.get(f.key);
    if (f.type === "bool") { data[f.key] = raw === "on"; continue; }
    if (raw === null || String(raw).trim() === "") continue;
    const v = String(raw).slice(0, 5000);
    if (f.type === "number") { const n = Number(v); if (Number.isFinite(n)) data[f.key] = n; }
    else if (f.type === "datetime") data[f.key] = new Date(v).toISOString();
    else if (f.type === "select") { if (f.options?.includes(v)) data[f.key] = v; }
    else data[f.key] = v;
  }
  return data;
}

export async function sysCreate(lang: string, key: string, fd: FormData) {
  const { supabase, user, profile } = await getSessionProfile();
  const cat = await getCatalog(supabase, profile);
  const sys = cat.getSystem(key);
  if (!sys || !user || !cat.canWrite(sys.area)) return;
  const site = String(fd.get("site_id") ?? "");
  const { error } = await supabase.from("records").insert({ module: key, data: readSysForm(sys, fd), site_id: site || null });
  revalidatePath(`/${lang}/panel/sistemas/${key}`);
  redirect(`/${lang}/panel/sistemas/${key}?${error ? "error" : "ok"}=1`);
}

export async function sysUpdate(lang: string, key: string, id: string, fd: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const cat = await getCatalog(supabase, profile);
  const sys = cat.getSystem(key);
  if (!sys || !cat.canWrite(sys.area)) return;
  const site = String(fd.get("site_id") ?? "");
  const patch: Record<string, unknown> = { data: readSysForm(sys, fd) };
  if (!profile?.site_id && fd.has("site_id")) patch.site_id = site || null;
  const { error } = await supabase.from("records").update(patch).eq("id", id).eq("module", key);
  revalidatePath(`/${lang}/panel/sistemas/${key}`);
  redirect(error ? `/${lang}/panel/sistemas/${key}/${id}?error=1` : `/${lang}/panel/sistemas/${key}?ok=1`);
}

export async function sysDelete(lang: string, key: string, id: string) {
  const { supabase, profile } = await getSessionProfile();
  const cat = await getCatalog(supabase, profile);
  const sys = cat.getSystem(key);
  if (!sys || !cat.canWrite(sys.area)) return;
  await supabase.from("records").delete().eq("id", id).eq("module", key);
  revalidatePath(`/${lang}/panel/sistemas/${key}`);
}

// ================= AULA VIRTUAL =================
const aula = (lang: string, courseId: string, rest = "") => `/${lang}/panel/aula/${courseId}${rest}`;

export async function enroll(lang: string, courseId: string) {
  const { supabase, user } = await getSessionProfile();
  if (!user) return;
  const { error } = await supabase.from("course_students").insert({ course_id: courseId, user_id: user.id });
  revalidatePath(`/${lang}/panel/aula`);
  redirect(error ? `/${lang}/panel/aula?${error.message.includes("course_full") ? "full" : "error"}=1` : aula(lang, courseId));
}

export async function leaveCourse(lang: string, courseId: string) {
  const { supabase, user } = await getSessionProfile();
  if (!user) return;
  await supabase.from("course_students").delete().eq("course_id", courseId).eq("user_id", user.id);
  revalidatePath(`/${lang}/panel/aula`);
  redirect(`/${lang}/panel/aula`);
}

export async function completeLesson(lang: string, courseId: string, lessonId: string, nextId: string | null) {
  const { supabase, user } = await getSessionProfile();
  if (!user) return;
  await supabase.from("lesson_progress").upsert({ lesson_id: lessonId, user_id: user.id }, { onConflict: "lesson_id,user_id", ignoreDuplicates: true });
  revalidatePath(aula(lang, courseId));
  redirect(nextId ? aula(lang, courseId, `/leccion/${nextId}`) : aula(lang, courseId));
}

export async function submitWork(lang: string, courseId: string, assignmentId: string, fd: FormData) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) return;
  const row = {
    assignment_id: assignmentId,
    user_id: user.id,
    student_name: profile?.full_name || user.email,
    content: String(fd.get("content") ?? "").slice(0, 20000) || null,
    link: String(fd.get("link") ?? "").slice(0, 1000) || null,
  };
  const { data: existing } = await supabase.from("submissions").select("id, grade").eq("assignment_id", assignmentId).eq("user_id", user.id).maybeSingle();
  const { error } = existing
    ? await supabase.from("submissions").update({ content: row.content, link: row.link }).eq("id", existing.id)
    : await supabase.from("submissions").insert(row);
  redirect(aula(lang, courseId, `/tarea/${assignmentId}?${error ? "error" : "ok"}=1`));
}

export async function takeQuiz(lang: string, courseId: string, fd: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) return;
  const answers: Record<string, string> = {};
  fd.forEach((v, k) => { if (k.startsWith("q_")) answers[k.slice(2)] = String(v); });
  const { data, error } = await supabase.rpc("submit_quiz", { c: courseId, answers });
  const r = (data as { score: number; total: number }[] | null)?.[0];
  redirect(aula(lang, courseId, error || !r ? "/examen?error=1" : `/examen?s=${r.score}&t=${r.total}`));
}
