import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { sysTitle, areaTitle } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-db";
import { getUi5 } from "@/lib/ui5-i18n";

export const dynamic = "force-dynamic";

export default async function SystemsHub({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string } }) {
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi4(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const cat = await getCatalog(supabase, profile);
  const u5 = getUi5(lang);
  const isAdmin = profile?.role === "admin";
  const q = (searchParams.q ?? "").trim().toLocaleLowerCase(lang).slice(0, 80);

  const areas = cat.areas.filter((a) => cat.canRead(a.key));
  const { data } = await supabase.from("records").select("module").limit(20000);
  const counts = ((data ?? []) as { module: string }[]).reduce<Record<string, number>>((acc, r) => ((acc[r.module] = (acc[r.module] ?? 0) + 1), acc), {});
  const visible = cat.systems.filter((s) => cat.canRead(s.area));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-light p-8 text-white">
        <h1 className="text-3xl font-extrabold">🧩 {u.sys.title}</h1>
        <p className="mt-1 text-white/80">{u.sys.desc}</p>
        <p className="mt-3 text-sm text-brand-gold">{visible.length} {u.sys.systems} · {areas.length} {u.sys.areas}</p>
        {isAdmin && <Link href={`/${lang}/panel/sistemas/gestionar`} className="mt-3 inline-block rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25">🛠 {u5.mods.manage}</Link>}
        <form className="mt-5 flex max-w-xl gap-2">
          <input name="q" defaultValue={searchParams.q ?? ""} placeholder={u.sys.search} maxLength={80} className="input flex-1 text-slate-800" />
          <button className="rounded-lg bg-brand-gold px-4 font-semibold text-brand">{t.common.search}</button>
        </form>
      </div>

      {areas.map((a) => {
        const items = visible.filter((s) => s.area === a.key && (!q || sysTitle(s, lang).toLocaleLowerCase(lang).includes(q) || areaTitle(a, lang).toLocaleLowerCase(lang).includes(q)));
        if (items.length === 0) return null;
        return (
          <section key={a.key}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <span>{a.icon}</span> {areaTitle(a, lang)}
              {!cat.canWrite(a.key) && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">{u.sys.readOnly}</span>}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {items.map((s) => (
                <Link key={s.key} href={`/${lang}/panel/sistemas/${s.key}`} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-xl">{s.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{sysTitle(s, lang)}</p>
                    <p className="text-xs text-slate-500">{counts[s.key] ?? 0} {u.sys.records}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {q && !areas.some((a) => visible.some((s) => s.area === a.key && sysTitle(s, lang).toLocaleLowerCase(lang).includes(q))) && (
        <p className="card text-sm text-slate-500">{u.sys.noResults}</p>
      )}
    </div>
  );
}
