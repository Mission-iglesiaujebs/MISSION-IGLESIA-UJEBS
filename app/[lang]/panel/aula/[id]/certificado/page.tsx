import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { site } from "@/config/site";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function Certificate({ params }: { params: { lang: string; id: string } }) {
  const { lang, id } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const u = getUi4(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);

  const [{ data: course }, { data: lessons }, { data: done }] = await Promise.all([
    supabase.from("courses").select("title, teacher").eq("id", id).maybeSingle(),
    supabase.from("lessons").select("id").eq("course_id", id),
    supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", user.id),
  ]);
  if (!course) notFound();
  const ids = ((lessons ?? []) as { id: string }[]).map((l) => l.id);
  const mine = ((done ?? []) as { lesson_id: string; completed_at: string }[]).filter((d) => ids.includes(d.lesson_id));
  const complete = ids.length > 0 && mine.length === ids.length;
  const finished = complete ? new Date(Math.max(...mine.map((d) => new Date(d.completed_at).getTime()))) : null;

  if (!complete) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Link href={`/${lang}/panel/aula/${id}`} className="text-sm text-brand">← {course.title}</Link>
        <p className="card text-center">🔒 {u.aula.locked} ({mine.length}/{ids.length})</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between print:hidden">
        <Link href={`/${lang}/panel/aula/${id}`} className="text-sm text-brand">← {course.title}</Link>
        <PrintButton label={u.aula.print} />
      </div>
      <div className="mx-auto aspect-[1.414/1] max-w-4xl rounded-2xl border-[10px] border-double border-brand-gold bg-white p-10 text-center shadow-xl print:shadow-none">
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <span className="text-5xl text-brand-gold">✝</span>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">{site.name}</p>
          <h1 className="font-serif text-4xl font-bold text-slate-800">{u.aula.certTitle}</h1>
          <p className="text-slate-500">{u.aula.certBody}</p>
          <p className="font-serif text-3xl italic text-brand">{profile?.full_name || user.email}</p>
          <p className="text-slate-500">{u.aula.certDone}</p>
          <p className="text-2xl font-bold">«{course.title}»</p>
          <div className="mt-6 flex w-full max-w-lg justify-between text-sm text-slate-500">
            <div className="border-t border-slate-300 pt-2">{course.teacher ?? site.shortName}<br />{u.aula.teacher}</div>
            <div className="border-t border-slate-300 pt-2">{finished!.toLocaleDateString(lang, { dateStyle: "long" })}<br />{site.verse}</div>
          </div>
          <p className="mt-2 font-mono text-[10px] text-slate-400">ID {id.slice(0, 8)}-{user.id.slice(0, 8)}</p>
        </div>
      </div>
    </div>
  );
}
