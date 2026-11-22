import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { getSettings, mediaUrl } from "@/lib/settings";
import { getUi5 } from "@/lib/ui5-i18n";
import { youtubeEmbed } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type Site = { id: string; name: string; country: string; city: string; schedule: string | null; address: string | null; region_id: string | null; logo_path: string | null; cover_path: string | null };
type Row = Record<string, string | boolean | null>;
const ICONS = ["🎸", "🔥", "🧒", "🌸", "🛡", "👨‍👩‍👧", "🌍", "🛐", "📚", "🤲", "🏘", "📡"];

export default async function Home({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string; region?: string } }) {
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi5(lang);
  const s = await getSettings();
  const q = (searchParams.q ?? "").slice(0, 100).trim().toLocaleLowerCase(lang);
  const regionFilter = searchParams.region ?? "";

  let events: Row[] = [], sermons: Row[] = [], news: Row[] = [], streams: Row[] = [];
  let sites: Site[] = [], regions: { id: string; name: string }[] = [];
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const [e, sr, a, d, l, r] = await Promise.all([
      supabase.from("events").select("id,title,starts_at,location").eq("is_public", true).gte("starts_at", now).order("starts_at").limit(4),
      supabase.from("sermons").select("id,title,preacher,date,video_url,bible_passage").order("date", { ascending: false }).limit(3),
      supabase.from("announcements").select("id,title,body").eq("is_public", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("sites").select("id,name,country,city,schedule,address,region_id,logo_path,cover_path").eq("published", true).order("country").order("city"),
      supabase.from("livestreams").select("id,title,youtube_url,starts_at,is_live").order("starts_at", { ascending: false }).limit(5),
      supabase.from("regions").select("id,name").order("name"),
    ]);
    events = (e.data as Row[]) ?? []; sermons = (sr.data as Row[]) ?? []; news = (a.data as Row[]) ?? [];
    streams = (l.data as Row[]) ?? []; regions = (r.data as { id: string; name: string }[]) ?? [];
    sites = (d.data as Site[]) ?? [];
    if (d.error) {
      // base sin columnas de la Fase 5
      const d2 = await supabase.from("sites").select("id,name,country,city,schedule,address").eq("published", true).order("country");
      sites = ((d2.data ?? []) as Site[]).map((x) => ({ ...x, region_id: null, logo_path: null, cover_path: null }));
    }
  } catch { /* Supabase no configurado */ }

  const countries = new Set(sites.map((x) => x.country.trim().toLowerCase())).size;
  const live = streams.find((x) => x.is_live);
  const liveEmbed = live ? youtubeEmbed(String(live.youtube_url)) : null;
  const liveHref = live ? String(live.youtube_url) : s.liveUrl;

  const filtered = sites.filter((x) =>
    (!regionFilter || (regionFilter === "none" ? !x.region_id : x.region_id === regionFilter)) &&
    (!q || [x.name, x.country, x.city].some((v) => v.toLocaleLowerCase(lang).includes(q))));
  const byCountry = filtered.reduce<Record<string, Site[]>>((acc, x) => ((acc[x.country] ??= []).push(x), acc), {});

  const stats = [
    { n: sites.length, l: u.web.stats.churches },
    { n: countries, l: u.web.stats.countries },
    { n: regions.length, l: u.web.stats.regions },
    { n: 5, l: u.web.stats.languages },
  ];

  return (
    <div className="-mt-8 space-y-20">
      {/* HERO */}
      <section className="relative -mx-4 overflow-hidden bg-brand px-6 pb-20 pt-20 text-white sm:rounded-b-[3rem] md:px-14 md:pt-28">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-glow rounded-full bg-brand-light/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] animate-glow rounded-full bg-brand-gold/30 blur-3xl [animation-delay:2s]" />
        <div className="pointer-events-none absolute right-10 top-6 select-none text-[14rem] leading-none text-white/[0.04] md:text-[22rem]">✝</div>
        <div className="relative mx-auto max-w-5xl animate-rise text-center">
          {s.logo && <img src={s.logo} alt="" className="mx-auto mb-6 h-24 w-24 rounded-3xl bg-white/10 object-contain p-2 shadow-2xl ring-1 ring-white/20" />}
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-brand-gold ring-1 ring-white/15">✝ {s.verse}</p>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">{s.name}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75 md:text-xl">{s.tagline ?? t.home.subtitle}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#iglesias" className="rounded-full bg-brand-gold px-7 py-3.5 font-semibold text-brand shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:brightness-110">⛪ {u.web.heroCta}</a>
            {liveHref && <a href={liveHref} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-7 py-3.5 font-semibold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20">{live ? "🔴" : "▶"} {u.web.watchLive}</a>}
            <Link href={`/${lang}/login?mode=signup`} className="rounded-full px-7 py-3.5 font-semibold ring-1 ring-white/30 transition hover:bg-white/10">{u.web.join}</Link>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur">
                <p className="text-3xl font-black text-brand-gold">{x.n}</p>
                <p className="text-xs uppercase tracking-wider text-white/60">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EN VIVO */}
      {live && (
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl md:grid md:grid-cols-5">
          <div className="aspect-video md:col-span-3">{liveEmbed ? <iframe src={liveEmbed} title={String(live.title)} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : null}</div>
          <div className="flex flex-col justify-center gap-3 p-8 md:col-span-2">
            <span className="w-fit animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-bold">● {u.web.live}</span>
            <h2 className="text-2xl font-bold">{String(live.title)}</h2>
            <a href={String(live.youtube_url)} target="_blank" rel="noopener noreferrer" className="w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">{u.web.watchLive} ↗</a>
          </div>
        </section>
      )}

      {/* MINISTERIOS */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">{u.web.ministries}</h2>
          <p className="mt-2 text-slate-500">{u.web.ministriesDesc}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {u.web.ministryList.map((m, i) => (
            <div key={m} className="group rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl hover:ring-brand/30">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-brand-gold/20 text-2xl transition group-hover:scale-110">{ICONS[i]}</span>
              <p className="mt-3 text-sm font-semibold">{m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTOS · PRÉDICAS · NOTICIAS */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card">
          <h2 className="mb-4 text-lg font-bold">📅 {u.web.events}</h2>
          {events.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-3">
              {events.map((e) => {
                const d = new Date(String(e.starts_at));
                return (
                  <li key={String(e.id)} className="flex gap-3">
                    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-white">
                      <span className="text-lg font-black leading-none">{d.getDate()}</span>
                      <span className="text-[10px] uppercase">{d.toLocaleDateString(lang, { month: "short" })}</span>
                    </span>
                    <div><p className="font-semibold">{String(e.title)}</p><p className="text-xs text-slate-500">{d.toLocaleTimeString(lang, { timeStyle: "short" })}{e.location ? ` · ${e.location}` : ""}</p></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-bold">📖 {u.web.sermons}</h2>
          {sermons.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-3">
              {sermons.map((x) => (
                <li key={String(x.id)} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold">{String(x.title)}</p>
                  <p className="text-xs text-slate-500">{[x.preacher, x.bible_passage, x.date].filter(Boolean).join(" · ")}</p>
                  {x.video_url && <a href={String(x.video_url)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-medium text-brand">▶ {t.home.watch}</a>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-bold">📢 {u.web.news}</h2>
          {news.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="space-y-3">
              {news.map((n) => (
                <li key={String(n.id)} className="border-l-4 border-brand-gold pl-3">
                  <p className="font-semibold">{String(n.title)}</p>
                  <p className="line-clamp-3 text-sm text-slate-600">{String(n.body)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* IGLESIAS POR REGIÓN Y PAÍS */}
      <section id="iglesias" className="scroll-mt-24 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">⛪ {u.web.churches}</h2>
          <p className="mt-2 text-slate-500">{u.web.churchesDesc}</p>
        </div>
        <form action={`/${lang}#iglesias`} className="mx-auto flex max-w-2xl flex-wrap gap-2">
          {regionFilter && <input type="hidden" name="region" value={regionFilter} />}
          <input name="q" defaultValue={searchParams.q ?? ""} maxLength={100} placeholder={t.sites.searchLabel} className="input flex-1 rounded-full px-5 py-3" />
          <button className="btn rounded-full px-6">{t.sites.searchBtn}</button>
        </form>
        {regions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Link href={`/${lang}#iglesias`} className={`rounded-full px-4 py-1.5 ring-1 ${!regionFilter ? "bg-brand text-white ring-brand" : "bg-white ring-slate-200 hover:ring-brand"}`}>{u.web.allRegions}</Link>
            {regions.map((r) => (
              <Link key={r.id} href={`/${lang}?region=${r.id}#iglesias`} className={`rounded-full px-4 py-1.5 ring-1 ${regionFilter === r.id ? "bg-brand text-white ring-brand" : "bg-white ring-slate-200 hover:ring-brand"}`}>🌎 {r.name}</Link>
            ))}
          </div>
        )}
        {sites.length === 0 ? <p className="card text-center text-sm text-slate-500">{t.sites.noSites}</p>
          : filtered.length === 0 ? <p className="card text-center text-sm text-slate-500">{t.sites.noResults}</p> : (
          <div className="space-y-8">
            {Object.entries(byCountry).map(([country, list]) => (
              <div key={country}>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">📍 {country} <span className="text-sm font-normal text-slate-400">({list.length})</span></h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((x) => {
                    const logo = mediaUrl(x.logo_path);
                    const cover = mediaUrl(x.cover_path);
                    return (
                      <Link key={x.id} href={`/${lang}/iglesia/${x.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
                        <div className="relative h-28 bg-gradient-to-br from-brand to-brand-light">
                          {cover && <img src={cover} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:scale-105" />}
                          <span className="absolute -bottom-6 left-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-2xl shadow-lg ring-4 ring-white">{logo ? <img src={logo} alt="" className="h-full w-full object-contain" /> : "⛪"}</span>
                        </div>
                        <div className="p-4 pt-8">
                          <p className="font-bold group-hover:text-brand">{x.name}</p>
                          <p className="text-sm text-slate-500">{x.city}, {x.country}</p>
                          <p className="mt-2 text-xs text-slate-600">⏰ {x.schedule || t.sites.scheduleTbc}</p>
                          <p className="mt-3 text-sm font-semibold text-brand">{u.web.visit} →</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ORACIÓN */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-gold/90 to-brand-gold p-10 text-center text-brand md:p-14">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[12rem] leading-none text-white/20">🙏</div>
        <h2 className="relative text-3xl font-black">{u.web.prayer}</h2>
        <p className="relative mx-auto mt-2 max-w-xl text-brand/80">{u.web.prayerDesc}</p>
        <Link href={`/${lang}/login`} className="relative mt-6 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white shadow-xl hover:brightness-110">{u.web.members}</Link>
      </section>
    </div>
  );
}
