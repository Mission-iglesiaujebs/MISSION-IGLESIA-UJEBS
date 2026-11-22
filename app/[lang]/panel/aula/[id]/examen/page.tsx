import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { takeQuiz } from "@/app/actions4";

export const dynamic = "force-dynamic";

type Q = { id: string; question: string; option_a: string; option_b: string; option_c: string | null; option_d: string | null };

export default async function Exam({ params, searchParams }: { params: { lang: string; id: string }; searchParams: { s?: string; t?: string; error?: string } }) {
  const { lang, id } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const u = getUi4(lang);
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const { data } = await supabase.rpc("get_quiz", { c: id });
  const qs = (data ?? []) as Q[];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={`/${lang}/panel/aula/${id}`} className="text-sm text-brand">← {u.aula.course}</Link>
      <h1 className="text-2xl font-bold">❓ {u.aula.exam}</h1>
      {searchParams.s !== undefined && (
        <div className="card border-l-4 border-brand text-center">
          <p className="text-sm text-slate-500">{u.aula.result}</p>
          <p className="text-4xl font-extrabold text-brand">{searchParams.s} / {searchParams.t}</p>
        </div>
      )}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{u.aula.notEnrolled}</p>}
      {qs.length === 0 ? <p className="card text-sm text-slate-500">{u.aula.noQuestions}</p> : (
        <form action={takeQuiz.bind(null, lang, id)} className="space-y-4">
          {qs.map((q, i) => (
            <fieldset key={q.id} className="card">
              <legend className="mb-3 font-semibold">{i + 1}. {q.question}</legend>
              {(["a", "b", "c", "d"] as const).map((o) => {
                const text = q[`option_${o}` as keyof Q];
                if (!text) return null;
                return (
                  <label key={o} className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 p-3 hover:bg-brand/10">
                    <input type="radio" name={`q_${q.id}`} value={o} required className="h-4 w-4" />
                    <span><b className="uppercase">{o})</b> {text}</span>
                  </label>
                );
              })}
            </fieldset>
          ))}
          <button className="btn w-full py-3">📤 {u.aula.send}</button>
        </form>
      )}
    </div>
  );
}
