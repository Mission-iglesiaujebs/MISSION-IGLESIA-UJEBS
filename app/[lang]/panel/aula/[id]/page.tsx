import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { liveRoom } from "@/lib/youtube";
import { enroll, leaveCourse } from "@/app/actions4";

export const dynamic = "force-dynamic";

export default async function Course({ params }: { params: { lang: string; id: string } }) {
  const { lang, id } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const u = getUi4(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const leader = ["lider", "secretaria", "pastor", "admin"].includes(profile?.role ?? "");

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) notFound();
  const [{ data: me }, { data: lessons }, { data: assignments }, { data: done }, { data: subs }, { data: results }] = await Promise.all([
    supabase.from("course_students").select("course_id").eq("course_id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("lessons").select("id,title,position").eq("course_id", id).order("position").order("created_at"),
    supabase.from("assignments").select("id,title,due_at,points").eq("course_id", id).order("due_at"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
    supabase.from("submissions").select("assignment_id,grade").eq("user_id", user.id),
    supabase.from("quiz_results").select("score,total,taken_at").eq("course_id", id).eq("user_id", user.id).order("taken_at", { ascending: false }).limit(1),
  ]);
  const enrolled = !!me;
  const ls = (lessons ?? []) as { id: string; title: string; position: number }[];
  const doneSet = new Set(((done ?? []) as { lesson_id: string }[]).map((d) => d.lesson_id));
  const completed = ls.filter((l) => doneSet.has(l.id)).length;
  const pct = ls.length ? Math.round((completed / ls.length) * 100) : 0;
  const subMap = new Map(((subs ?? []) as { assignment_id: string; grade: number | null }[]).map((s) => [s.assignment_id, s]));
  const last = ((results ?? []) as { score: number; total: number }[])[0];
  const canSee = enrolled || leader;

  return (
    <div className="space-y-6">
      <Link href={`/${lang}/panel/aula`} className="text-sm text-brand">← {u.aula.title}</Link>
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-light p-8 text-white">
        <h1 className="text-3xl font-extrabold">{course.title}</h1>
        <p className="mt-1 text-white/80">{course.teacher && `${u.aula.teacher}: ${course.teacher}`}{course.schedule && ` · ${course.schedule}`}</p>
        {course.description && <p className="mt-3 max-w-2xl text-sm text-white/90">{course.description}</p>}
        {enrolled && (
          <div className="mt-5 max-w-md">
            <div className="mb-1 flex justify-between text-xs"><span>{u.aula.progress}</span><span>{completed}/{ls.length} · {pct}%</span></div>
            <div className="h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-brand-gold" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          {canSee && <a href={liveRoom(id, course.live_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold">🔴 {u.aula.joinLive}</a>}
          {enrolled && <Link href={`/${lang}/panel/aula/${id}/examen`} className="rounded-xl bg-white/15 px-5 py-2.5 font-semibold hover:bg-white/25">❓ {u.aula.exam}</Link>}
          {enrolled && <Link href={`/${lang}/panel/aula/${id}/certificado`} className="rounded-xl bg-brand-gold px-5 py-2.5 font-semibold text-brand">🏅 {u.aula.certificate}</Link>}
          {!enrolled && course.is_open && <form action={enroll.bind(null, lang, id)}><button className="rounded-xl bg-brand-gold px-5 py-2.5 font-semibold text-brand">➕ {u.aula.enroll}</button></form>}
        </div>
      </div>

      {!canSee ? <p className="card text-sm text-slate-500">{u.aula.notEnrolled}</p> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-2">
            <h2 className="mb-3 text-lg font-bold">📚 {u.aula.lessons}</h2>
            {ls.length === 0 ? <p className="text-sm text-slate-500">{u.aula.noLessons}</p> : (
              <ol className="divide-y">
                {ls.map((l, i) => (
                  <li key={l.id}>
                    <Link href={`/${lang}/panel/aula/${id}/leccion/${l.id}`} className="flex items-center gap-3 py-3 hover:text-brand">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${doneSet.has(l.id) ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>{doneSet.has(l.id) ? "✓" : i + 1}</span>
                      <span className="font-medium">{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <div className="space-y-6">
            <section className="card">
              <h2 className="mb-3 text-lg font-bold">📝 {u.aula.assignments}</h2>
              {((assignments ?? []) as { id: string; title: string; due_at: string | null; points: number }[]).map((a) => {
                const s = subMap.get(a.id);
                return (
                  <Link key={a.id} href={`/${lang}/panel/aula/${id}/tarea/${a.id}`} className="mb-2 block rounded-xl bg-slate-50 p-3 text-sm hover:ring-1 hover:ring-brand">
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.due_at && `${u.aula.due}: ${new Date(a.due_at).toLocaleDateString(lang)} · `}{a.points} {u.aula.points}</p>
                    {s && <p className={`mt-1 text-xs font-semibold ${s.grade !== null ? "text-emerald-700" : "text-amber-700"}`}>{s.grade !== null ? `${u.aula.grade}: ${s.grade}` : u.aula.waiting}</p>}
                  </Link>
                );
              })}
            </section>
            {last && (
              <section className="card">
                <h2 className="mb-1 text-lg font-bold">❓ {u.aula.exam}</h2>
                <p className="text-sm">{u.aula.result}: <b>{last.score}/{last.total}</b></p>
              </section>
            )}
            {enrolled && <form action={leaveCourse.bind(null, lang, id)}><button className="text-sm text-red-600 hover:underline">{u.aula.leave}</button></form>}
          </div>
        </div>
      )}
    </div>
  );
}
