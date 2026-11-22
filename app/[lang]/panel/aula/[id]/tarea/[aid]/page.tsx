import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { submitWork } from "@/app/actions4";

export const dynamic = "force-dynamic";

export default async function Assignment({ params, searchParams }: { params: { lang: string; id: string; aid: string }; searchParams: { ok?: string; error?: string } }) {
  const { lang, id, aid } = params;
  if (!/^[0-9a-f-]{36}$/i.test(aid)) notFound();
  const t = getDict(lang);
  const u = getUi4(lang);
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);

  const [{ data: a }, { data: sub }, { data: me }] = await Promise.all([
    supabase.from("assignments").select("*").eq("id", aid).eq("course_id", id).maybeSingle(),
    supabase.from("submissions").select("*").eq("assignment_id", aid).eq("user_id", user.id).maybeSingle(),
    supabase.from("course_students").select("course_id").eq("course_id", id).eq("user_id", user.id).maybeSingle(),
  ]);
  if (!a) notFound();
  const graded = sub && sub.grade !== null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={`/${lang}/panel/aula/${id}`} className="text-sm text-brand">← {u.aula.course}</Link>
      <h1 className="text-2xl font-bold">📝 {a.title}</h1>
      <p className="text-sm text-slate-500">{a.due_at && `${u.aula.due}: ${new Date(a.due_at).toLocaleString(lang, { dateStyle: "full", timeStyle: "short" })} · `}{a.points} {u.aula.points}</p>
      {a.instructions && <article className="card whitespace-pre-wrap">{a.instructions}</article>}

      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {t.common.saved}</p>}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}

      {graded ? (
        <section className="card border-l-4 border-emerald-500">
          <p className="text-lg font-bold text-emerald-700">{u.aula.grade}: {sub.grade} / {a.points}</p>
          {sub.feedback && <p className="mt-2 whitespace-pre-wrap text-sm"><b>{u.aula.feedback}:</b> {sub.feedback}</p>}
          {sub.content && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm">{sub.content}</p>}
        </section>
      ) : me ? (
        <section className="card space-y-3">
          <h2 className="font-bold">{u.aula.yourWork}</h2>
          {sub && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">⏳ {u.aula.waiting}</p>}
          <form action={submitWork.bind(null, lang, id, aid)} className="space-y-3">
            <div><label className="label">{u.aula.content}</label><textarea name="content" rows={8} maxLength={20000} defaultValue={sub?.content ?? ""} className="input" /></div>
            <div><label className="label">{u.aula.link}</label><input name="link" type="url" defaultValue={sub?.link ?? ""} className="input" /></div>
            <button className="btn">📤 {u.aula.submit}</button>
          </form>
        </section>
      ) : <p className="card text-sm text-slate-500">{u.aula.notEnrolled}</p>}
    </div>
  );
}
