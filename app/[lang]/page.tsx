import Link from "next/link";
import { site } from "@/config/site";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = Record<string, string | boolean | null>;

// Convierte un enlace de YouTube (watch, youtu.be, live, shorts) en enlace embebible
function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v")!;
    else { const m = u.pathname.match(/\/(live|embed|shorts)\/([\w-]+)/); if (m) id = m[2]; }
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}

export default async function Home({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").slice(0, 100).trim();
  const t = getDict(params.lang);
  const lang = params.lang;
  let events: Row[] = [], sermons: Row[] = [], news: Row[] = [], sites: Row[] = [], streams: Row[] = [];
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const [e, s, a, d, l] = await Promise.all([
      supabase.from("events").select("id,title,starts_at,location").eq("is_public", true).gte("starts_at", now).order("starts_at").limit(6),
      supabase.from("sermons").select("id,title,preacher,date,video_url,bible_passage").order("date", { ascending: false }).limit(3),
      supabase.from("announcements").select("id,title,body").eq("is_public", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("sites").select("id,name,country,city,schedule,address").eq("published", true).order("country").order("city").order("name"),
      supabase.from("livestreams").select("id,title,youtube_url,starts_at,is_live").order("starts_at", { ascending: false }).limit(10),
    ]);
    events = (e.data as Row[]) ?? []; sermons = (s.data as Row[]) ?? []; news = (a.data as Row[]) ?? [];
    sites = (d.data as Row[]) ?? []; streams = (l.data as Row[]) ?? [];
  } catch { /* Supabase no configurado */ }

  const live = streams.find((s) => s.is_live);
  const nextStream = streams.filter((s) => !s.is_live && String(s.starts_at) > new Date().toISOString()).pop();
  const featured = live ?? nextStream;
  const embed = featured ? youtubeEmbed(String(featured.youtube_url)) : null;
  const found = sites.filter((r) => `${r.name} ${r.country} ${r.city}`.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
  const countries = new Set(sites.map((s) => s.country)).size;
  const date = (v: unknown, opts: Intl.DateTimeFormatOptions) => new Date(String(v)).toLocaleString(lang, opts);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-light px-8 py-16 text-white md:px-14 md:py-20">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[16rem] leading-none text-white/5">✝</div>
        <p className="font-semibold tracking-wide text-brand-gold">{site.verse}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">{t.home.welcome} {site.name}</h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">{t.home.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${lang}/login?mode=signup`} className="rounded-xl bg-brand-gold px-6 py-3 font-semibold text-brand shadow-lg hover:brightness-110">{t.home.joinUs}</Link>
          <a href="#sedes" className="rounded-xl px-6 py-3 font-semibold ring-1 ring-white/40 hover:bg-white/10">⛪ {t.sites.directory}</a>
        </div>
        {sites.length > 0 && (
          <div className="mt-10 flex gap-8 text-sm">
            <div><p className="text-3xl font-bold">{sites.length}</p><p className="text-white/70">{t.modules.sites.title}</p></div>
            <div><p className="text-3xl font-bold">{countries}</p><p className="text-white/70">{t.modules.sites.fields.country}</p></div>
          </div>
        )}
      </section>

      {/* Transmisión */}
      {featured && (
        <section className="card overflow-hidden p-0">
          <div className="grid md:grid-cols-5">
            {embed && (
              <div className="aspect-video bg-black md:col-span-3">
                <iframe src={embed} title={String(featured.title)} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              </div>
            )}
            <div className={`flex flex-col justify-center gap-3 p-6 ${embed ? "md:col-span-2" : "md:col-span-5"}`}>
              {live ? (
                <span className="w-fit animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">● {t.home.liveNow}</span>
              ) : (
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{t.home.nextStream}</span>
              )}
              <h2 className="text-2xl font-bold">{String(featured.title)}</h2>
              <p className="text-sm text-slate-500">{date(featured.starts_at, { dateStyle: "full", timeStyle: "short" })}</p>
              <a href={String(featured.youtube_url)} target="_blank" rel="noopener noreferrer" className="btn w-fit">▶ {t.home.watchLive}</a>
            </div>
          </div>
        </section>
      )}

      {/* Horarios + eventos */}
      <div className="grid gap-6 md:grid-cols-3">
        <section className="card">
          <h2 className="mb-4 text-lg font-bold">⏰ {t.home.schedule}</h2>
          <ul className="space-y-2 text-sm">
            {site.schedule.map((s) => (
              <li key={s.day + s.time} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{t.days[s.day as keyof typeof t.days]}</span><span className="font-semibold">{s.time}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card md:col-span-2">
          <h2 className="mb-4 text-lg font-bold">📅 {t.home.upcomingEvents}</h2>
          {events.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((e) => (
                <div key={String(e.id)} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand text-white">
                    <span className="text-lg font-bold leading-none">{date(e.starts_at, { day: "2-digit" })}</span>
                    <span className="text-[10px] uppercase">{date(e.starts_at, { month: "short" })}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{String(e.title)}</p>
                    <p className="text-xs text-slate-500">{date(e.starts_at, { timeStyle: "short" })}{e.location ? ` · ${e.location}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Prédicas + anuncios */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-lg font-bold">📖 {t.home.latestSermons}</h2>
          {sermons.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-3">
              {sermons.map((s) => (
                <li key={String(s.id)} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="font-semibold">{String(s.title)}</p>
                    <p className="text-xs text-slate-500">{s.preacher}{s.bible_passage ? ` · ${s.bible_passage}` : ""}</p>
                  </div>
                  {s.video_url && <a href={String(s.video_url)} target="_blank" rel="noopener noreferrer" className="btn shrink-0 px-3 py-1.5">▶ {t.home.watch}</a>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-4 text-lg font-bold">📢 {t.home.announcements}</h2>
          {news.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-3 text-sm">
              {news.map((n) => (
                <li key={String(n.id)} className="border-l-4 border-brand-gold pl-3">
                  <p className="font-semibold">{String(n.title)}</p>
                  <p className="text-slate-600">{String(n.body)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Directorio de sedes */}
      <section id="sedes" className="scroll-mt-6 space-y-4">
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
              <article key={String(r.id)} className="card transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">📍 {r.city}, {r.country}</p>
                <h3 className="mt-1 text-lg font-bold">{String(r.name)}</h3>
                <p className="mt-2 text-sm">⏰ {r.schedule || t.sites.scheduleTbc}</p>
                {r.address && <p className="text-xs text-slate-500">{String(r.address)}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-brand-gold/15 p-8 text-center">
        <p className="text-lg">🙏 {t.home.prayerCta}</p>
        <Link href={`/${lang}/login`} className="btn mt-4">{t.home.members}</Link>
      </section>
    </div>
  );
}
