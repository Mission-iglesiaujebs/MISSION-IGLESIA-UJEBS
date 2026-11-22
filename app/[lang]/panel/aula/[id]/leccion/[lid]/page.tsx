import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { youtubeEmbed } from "@/lib/youtube";
import { completeLesson } from "@/app/actions4";

export const dynamic = "force-dynamic";

export default async function Lesson({ params }: { params: { lang: string; id: string; lid: string } }) {
  const { lang, id, lid } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(lid)) notFound();
  const u = getUi4(lang);
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);

  const [{ data: lessons }, { data: me }, { data: done }] = await Promise.all([
    supabase.from("lessons").select("*").eq("course_id", id).order("position").order("created_at"),
    supabase.from("course_students").select("course_id").eq("course_id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("lesson_progress").select("lesson_id").eq("lesson_id", lid).eq("user_id", user.id).maybeSingle(),
  ]);
  const list = (lessons ?? []) as { id: string; title: string; content: string | null; video_url: string | null; material_url: string | null }[];
  const idx = list.findIndex((l) => l.id === lid);
  if (idx < 0) notFound();
  const lesson = list[idx];
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const embed = youtubeEmbed(lesson.video_url);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href={`/${lang}/panel/aula/${id}`} className="text-sm text-brand">← {u.aula.lessons} ({idx + 1}/{list.length})</Link>
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      {embed && (
        <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
          <iframe src={embed} title={lesson.title} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      )}
      {!embed && lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="btn">▶ Video</a>}
      {lesson.content && <article className="card whitespace-pre-wrap leading-relaxed">{lesson.content}</article>}
      {lesson.material_url && <a href={lesson.material_url} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 hover:ring-brand">📎 {u.aula.material}</a>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        {prev ? <Link href={`/${lang}/panel/aula/${id}/leccion/${prev.id}`} className="btn-ghost ring-1 ring-slate-200">← {u.aula.prev}</Link> : <span />}
        {me && (done ? (
          <span className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ {u.aula.completed}</span>
        ) : (
          <form action={completeLesson.bind(null, lang, id, lid, next?.id ?? null)}><button className="btn bg-emerald-600 hover:bg-emerald-700">✓ {u.aula.markDone}</button></form>
        ))}
        {next ? <Link href={`/${lang}/panel/aula/${id}/leccion/${next.id}`} className="btn">{u.aula.next} →</Link> : <span />}
      </div>
    </div>
  );
}
