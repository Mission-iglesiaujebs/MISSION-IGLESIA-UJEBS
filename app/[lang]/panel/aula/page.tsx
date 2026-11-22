import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { enroll } from "@/app/actions4";

export const dynamic = "force-dynamic";

type Course = { id: string; title: string; teacher: string | null; schedule: string | null; description: string | null; is_open: boolean; level: string | null };

export default async function Aula({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi4(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const leader = ["lider", "secretaria", "pastor", "admin"].includes(profile?.role ?? "");

  const [{ data: courses }, { data: mine }, { data: lessons }, { data: done }] = await Promise.all([
    supabase.from("courses").select("id,title,teacher,schedule,description,is_open,level").order("starts_on", { ascending: false }),
    supabase.from("course_students").select("course_id").eq("user_id", user.id),
    supabase.from("lessons").select("id,course_id"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
  ]);
  const all = (courses ?? []) as Course[];
  const enrolled = new Set(((mine ?? []) as { course_id: string }[]).map((m) => m.course_id));
  const doneSet = new Set(((done ?? []) as { lesson_id: string }[]).map((d) => d.lesson_id));
  const progress = (cid: string) => {
    const ls = ((lessons ?? []) as { id: string; course_id: string }[]).filter((l) => l.course_id === cid);
    return ls.length ? Math.round((ls.filter((l) => doneSet.has(l.id)).length / ls.length) * 100) : 0;
  };
  const myCourses = all.filter((c) => enrolled.has(c.id));
  const available = all.filter((c) => !enrolled.has(c.id) && c.is_open);

  const Card = ({ c, mineCard }: { c: Course; mineCard: boolean }) => (
    <div className="card flex flex-col">
      <div className="-mx-5 -mt-5 mb-4 flex h-24 items-center justify-center rounded-t-2xl bg-gradient-to-br from-brand to-brand-light text-4xl">🎓</div>
      <h3 className="font-bold">{c.title}</h3>
      <p className="text-xs text-slate-500">{c.teacher && `${u.aula.teacher}: ${c.teacher}`}{c.schedule && ` · ${c.schedule}`}{c.level && ` · ${c.level}`}</p>
      {c.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{c.description}</p>}
      <div className="mt-auto pt-4">
        {mineCard ? (
          <>
            <div className="mb-1 flex justify-between text-xs"><span>{u.aula.progress}</span><span className="font-semibold">{progress(c.id)}%</span></div>
            <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress(c.id)}%` }} /></div>
            <Link href={`/${lang}/panel/aula/${c.id}`} className="btn mt-3 w-full">▶ {u.aula.lessons}</Link>
          </>
        ) : (
          <form action={enroll.bind(null, lang, c.id)}><button className="btn w-full">➕ {u.aula.enroll}</button></form>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-gradient-to-br from-brand to-brand-light p-8 text-white">
        <div>
          <h1 className="text-3xl font-extrabold">🎓 {u.aula.title}</h1>
          <p className="mt-1 text-white/80">{u.aula.desc}</p>
        </div>
        {leader && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href={`/${lang}/panel/courses`} className="rounded-lg bg-white/15 px-3 py-2 hover:bg-white/25">⚙️ {u.aula.course}</Link>
            <Link href={`/${lang}/panel/lessons`} className="rounded-lg bg-white/15 px-3 py-2 hover:bg-white/25">📚 {u.aula.manageLessons}</Link>
            <Link href={`/${lang}/panel/assignments`} className="rounded-lg bg-white/15 px-3 py-2 hover:bg-white/25">📝 {u.aula.manageAssignments}</Link>
            <Link href={`/${lang}/panel/quiz_questions`} className="rounded-lg bg-white/15 px-3 py-2 hover:bg-white/25">❓ {u.aula.manageQuiz}</Link>
            <Link href={`/${lang}/panel/submissions`} className="rounded-lg bg-brand-gold px-3 py-2 font-semibold text-brand">✅ {u.aula.manageSubmissions}</Link>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">{u.aula.my}</h2>
        {myCourses.length === 0 ? <p className="card text-sm text-slate-500">{t.common.empty}</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{myCourses.map((c) => <Card key={c.id} c={c} mineCard />)}</div>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">{u.aula.available}</h2>
        {available.length === 0 ? <p className="card text-sm text-slate-500">{u.aula.noCourses}</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{available.map((c) => <Card key={c.id} c={c} mineCard={false} />)}</div>
        )}
      </section>
    </div>
  );
}
