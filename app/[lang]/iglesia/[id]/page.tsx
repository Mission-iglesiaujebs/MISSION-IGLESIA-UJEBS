import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/settings";
import { getUi5 } from "@/lib/ui5-i18n";

export const dynamic = "force-dynamic";

type Row = Record<string, string | boolean | null>;

// Página pública propia de cada iglesia de la misión
export default async function Church({ params }: { params: { lang: string; id: string } }) {
  const { lang, id } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = getDict(lang);
  const u = getUi5(lang);
  const supabase = createClient();
  const { data: c } = await supabase.from("sites").select("*, regions(name)").eq("id", id).eq("published", true).maybeSingle();
  if (!c) notFound();
  const now = new Date().toISOString();
  const [e, s, a] = await Promise.all([
    supabase.from("events").select("id,title,starts_at,location").eq("site_id", id).eq("is_public", true).gte("starts_at", now).order("starts_at").limit(6),
    supabase.from("sermons").select("id,title,preacher,date,video_url").eq("site_id", id).order("date", { ascending: false }).limit(4),
    supabase.from("announcements").select("id,title,body").eq("site_id", id).eq("is_public", true).order("created_at", { ascending: false }).limit(4),
  ]);
  const events = (e.data as Row[]) ?? [], sermons = (s.data as Row[]) ?? [], news = (a.data as Row[]) ?? [];
  const logo = mediaUrl(c.logo_path);
  const cover = mediaUrl(c.cover_path);
  const wa = c.whatsapp ? `https://wa.me/${String(c.whatsapp).replace(/\D/g, "")}` : null;
  const map = c.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.address}, ${c.city}, ${c.country}`)}` : null;
  const links = [
    { href: c.youtube, label: "YouTube" }, { href: c.facebook, label: "Facebook" },
    { href: c.instagram, label: "Instagram" }, { href: wa, label: "WhatsApp" },
  ].filter((l) => l.href);

  return (
    <div className="-mt-8 space-y-10">
      <section className="relative -mx-4 overflow-hidden text-white sm:rounded-b-[2.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-light" />
        {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-6 pb-12 pt-32 md:flex-row md:items-end">
          <span className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white text-5xl shadow-2xl ring-4 ring-white/40">{logo ? <img src={logo} alt="" className="h-full w-full object-contain" /> : "⛪"}</span>
          <div className="animate-rise">
            <Link href={`/${lang}#iglesias`} className="text-sm text-white/70 hover:text-white">← {u.web.back}</Link>
            <h1 className="mt-1 text-4xl font-black tracking-tight md:text-5xl">{c.name}</h1>
            <p className="mt-1 text-white/80">📍 {c.city}, {c.country}{c.regions?.name ? ` · 🌎 ${c.regions.name}` : ""}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {c.about && (
            <section className="card">
              <h2 className="mb-3 text-xl font-bold">{u.web.aboutUs}</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{c.about}</p>
            </section>
          )}
          <section className="card">
            <h2 className="mb-4 text-xl font-bold">📅 {u.web.events}</h2>
            {events.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {events.map((ev) => {
                  const d = new Date(String(ev.starts_at));
                  return (
                    <li key={String(ev.id)} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-white"><b className="leading-none">{d.getDate()}</b><span className="text-[10px] uppercase">{d.toLocaleDateString(lang, { month: "short" })}</span></span>
                      <div><p className="font-semibold">{String(ev.title)}</p><p className="text-xs text-slate-500">{d.toLocaleTimeString(lang, { timeStyle: "short" })}{ev.location ? ` · ${ev.location}` : ""}</p></div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card">
              <h2 className="mb-3 text-lg font-bold">📖 {u.web.sermons}</h2>
              {sermons.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : sermons.map((x) => (
                <p key={String(x.id)} className="mb-2 text-sm"><b>{String(x.title)}</b><br /><span className="text-slate-500">{[x.preacher, x.date].filter(Boolean).join(" · ")}</span>
                  {x.video_url && <> · <a href={String(x.video_url)} target="_blank" rel="noopener noreferrer" className="text-brand">▶ {t.home.watch}</a></>}</p>
              ))}
            </section>
            <section className="card">
              <h2 className="mb-3 text-lg font-bold">📢 {u.web.news}</h2>
              {news.length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : news.map((n) => (
                <div key={String(n.id)} className="mb-3 border-l-4 border-brand-gold pl-3 text-sm"><b>{String(n.title)}</b><p className="line-clamp-3 text-slate-600">{String(n.body)}</p></div>
              ))}
            </section>
          </div>
        </div>
        <aside className="space-y-6">
          <section className="card space-y-3 text-sm">
            <h2 className="text-lg font-bold">⏰ {u.web.schedule}</h2>
            <p className="rounded-xl bg-brand/5 p-3 font-medium">{c.schedule || t.sites.scheduleTbc}</p>
            {c.pastor_name && <p>🙏 {u.web.pastor}: <b>{c.pastor_name}</b></p>}
          </section>
          <section className="card space-y-2 text-sm">
            <h2 className="text-lg font-bold">📞 {u.web.contact}</h2>
            {c.address && <p>📍 {c.address}</p>}
            {c.phone && <p>📞 <a href={`tel:${c.phone}`} className="hover:text-brand">{c.phone}</a></p>}
            {c.email && <p>✉️ <a href={`mailto:${c.email}`} className="hover:text-brand">{c.email}</a></p>}
            {map && <a href={map} target="_blank" rel="noopener noreferrer" className="btn mt-2 w-full">🗺 {u.web.map}</a>}
          </section>
          {links.length > 0 && (
            <section className="card">
              <h2 className="mb-3 text-lg font-bold">{u.web.follow}</h2>
              <div className="flex flex-wrap gap-2">{links.map((l) => <a key={l.label} href={l.href!} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium hover:bg-brand hover:text-white">{l.label}</a>)}</div>
            </section>
          )}
          <Link href={`/${lang}/login`} className="card block bg-gradient-to-br from-brand to-brand-light text-center text-white">🙏 <b>{u.web.prayer}</b><p className="mt-1 text-sm text-white/80">{u.web.prayerDesc}</p></Link>
        </aside>
      </div>
    </div>
  );
}
