import Link from "next/link";
import { site } from "@/config/site";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = Record<string, string | null>;

export default async function Home({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").slice(0, 100).trim();
  const t = getDict(params.lang);
  const lang = params.lang;
  let events: Row[] = [], sermons: Row[] = [], news: Row[] = [], sites: Row[] = [];
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const [e, s, a, d] = await Promise.all([
      supabase.from("events").select("id,title,starts_at,location").eq("is_public", true).gte("starts_at", now).order("starts_at").limit(4),
      supabase.from("sermons").select("id,title,preacher,date,video_url").order("date", { ascending: false }).limit(3),
      supabase.from("announcements").select("id,title,body").eq("is_public", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("sites").select("id,name,country,city,schedule,address").eq("published", true).order("country").order("city").order("name"),
    ]);
    events = (e.data as Row[]) ?? []; sermons = (s.data as Row[]) ?? []; news = (a.data as Row[]) ?? []; sites = (d.data as Row[]) ?? [];
  } catch { /* Supabase aún no configurado */ }

  const found = sites.filter((r) => `${r.name} ${r.country} ${r.city}`.toLocaleLowerCase().includes(q.toLocaleLowerCase()));

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-light px-8 py-14 text-white">
        <p className="text-brand-gold">{site.verse}</p>
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">{t.home.welcome} {site.name}</h1>
        <p className="mt-3 max-w-xl text-white/80">{t.home.subtitle}</p>
        <Link href={`/${lang}/login`} className="mt-6 inline-block rounded-lg bg-brand-gold px-5 py-2.5 font-semibold text-brand">{t.home.joinUs}</Link>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="card">
          <h2 className="mb-3 font-bold">⏰ {t.home.schedule}</h2>
          <ul className="space-y-1 text-sm">
            {site.schedule.map((s) => (
              <li key={s.day + s.time} className="flex justify-between"><span>{t.days[s.day as keyof typeof t.days]}</span><span className="font-medium">{s.time}</span></li>
            ))}
          </ul>
        </section>
        <section className="card md:col-span-2">
          <h2 className="mb-3 font-bold">📅 {t.home.upcomingEvents}</h2>
          {events.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="divide-y text-sm">
              {events.map((e) => (
                <li key={e.id!} className="flex justify-between py-2">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-slate-500">{e.starts_at && new Date(e.starts_at).toLocaleString(lang)} · {e.location}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-bold">📖 {t.home.latestSermons}</h2>
          {sermons.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-2 text-sm">
              {sermons.map((s) => (
                <li key={s.id!} className="flex items-center justify-between">
                  <span><b>{s.title}</b> — {s.preacher}</span>
                  {s.video_url && <a href={s.video_url} target="_blank" className="text-brand underline">{t.home.watch}</a>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-bold">📢 {t.home.announcements}</h2>
          {news.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-3 text-sm">
              {news.map((n) => <li key={n.id!}><b>{n.title}</b><p className="text-slate-600">{n.body}</p></li>)}
            </ul>
          )}
        </section>
      </div>


      <section id="sedes" className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">⛪ {t.sites.directory}</h2>
          <p className="text-sm text-slate-500">{t.sites.directoryDesc}</p>
        </div>
        <form action={`/${lang}#sedes`} className="flex flex-wrap items-end gap-2">
          <div className="min-w-64 flex-1">
            <label className="label">{t.sites.searchLabel}</label>
            <input name="q" defaultValue={q} maxLength={100} className="input" />
          </div>
          <button className="btn">{t.sites.searchBtn}</button>
          {q && <Link href={`/${lang}#sedes`} className="btn-ghost">{t.sites.seeAll}</Link>}
        </form>
        {found.length === 0 ? (
          <p className="card text-sm text-slate-500">{q ? t.sites.noResults : t.sites.noSites}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {found.map((r) => (
              <article key={r.id!} className="card">
                <p className="text-xs text-slate-500">{r.city}, {r.country}</p>
                <h3 className="font-bold">{r.name}</h3>
                <p className="text-sm">{r.schedule || t.sites.scheduleTbc}</p>
                {r.address && <p className="text-xs text-slate-500">{r.address}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card text-center">
        <p>🙏 {t.home.prayerCta}</p>
      </section>
    </div>
  );
}
