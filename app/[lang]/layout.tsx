import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, localeNames } from "@/config/site";
import { getDict, isLocale } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getSettings, themeVars } from "@/lib/settings";
import { signOut } from "@/app/actions";
import { InstallApp } from "@/components/InstallApp";
import { getPwaText } from "@/lib/pwa-i18n";
import { getUi5 } from "@/lib/ui5-i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata() {
  const s = await getSettings();
  return { title: { default: s.name, template: `%s · ${s.shortName}` }, description: s.tagline ?? s.name, icons: s.logo ? { icon: s.logo } : undefined };
}

const Social = ({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) =>
  href ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-brand-gold hover:text-brand">{children}</a> : null;

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const t = getDict(params.lang);
  const lang = params.lang;
  const [{ user }, s] = await Promise.all([getSessionProfile(), getSettings()]);
  const pwa = getPwaText(lang);
  const u = getUi5(lang);
  const wa = s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <html lang={lang} className="scroll-smooth">
      <body className="flex min-h-screen flex-col" style={themeVars(s)}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-brand/90 text-white shadow-lg backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
            <Link href={`/${lang}`} className="mr-auto flex items-center gap-2.5 font-bold">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-brand-gold ring-1 ring-white/20">
                {s.logo ? <img src={s.logo} alt="" className="h-full w-full object-contain" /> : "✝"}
              </span>
              <span className="hidden leading-tight sm:block">{s.shortName}<span className="block text-[10px] font-normal uppercase tracking-[0.2em] text-white/60">{s.verse}</span></span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href={`/${lang}#iglesias`} className="hidden rounded-lg px-3 py-1.5 hover:bg-white/10 md:block">⛪ {u.web.churches}</Link>
              {user ? (
                <>
                  <Link href={`/${lang}/panel`} className="rounded-lg px-3 py-1.5 hover:bg-white/10">{t.nav.panel}</Link>
                  <form action={signOut.bind(null, lang)}>
                    <button className="rounded-lg px-3 py-1.5 hover:bg-white/10">{t.nav.logout}</button>
                  </form>
                </>
              ) : (
                <Link href={`/${lang}/login`} className="rounded-full bg-brand-gold px-4 py-1.5 font-semibold text-brand shadow hover:brightness-110">{t.nav.login}</Link>
              )}
            </nav>
            <InstallApp t={pwa} />
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-lg px-2 py-1.5 text-xs font-semibold uppercase ring-1 ring-white/30 hover:bg-white/10">🌐 {lang}</summary>
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl bg-white text-sm text-slate-700 shadow-xl">
                {locales.map((l) => (
                  <Link key={l} href={`/${l}`} className={`block px-4 py-2 hover:bg-slate-100 ${l === lang ? "font-bold text-brand" : ""}`}>{localeNames[l]}</Link>
                ))}
              </div>
            </details>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
        <footer className="bg-slate-950 text-slate-300">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="flex items-center gap-3 text-base font-bold text-white">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-brand text-brand-gold">{s.logo ? <img src={s.logo} alt="" className="h-full w-full object-contain" /> : "✝"}</span>
                {s.name}
              </p>
              <p className="mt-3 max-w-md text-slate-400">{s.tagline ?? t.home.about}</p>
              <div className="mt-5 flex gap-2 text-lg">
                <Social href={s.youtube} label="YouTube">▶</Social>
                <Social href={s.facebook} label="Facebook">f</Social>
                <Social href={s.instagram} label="Instagram">◎</Social>
                <Social href={wa} label="WhatsApp">✆</Social>
              </div>
            </div>
            <div>
              <p className="mb-3 font-semibold text-white">{t.home.contact}</p>
              <p>📍 {s.address}</p>
              <p>📞 {s.phone}</p>
              <p>✉️ {s.email}</p>
              <p className="mt-4 flex gap-3">{locales.map((l) => <Link key={l} href={`/${l}`} className="uppercase hover:text-white">{l}</Link>)}</p>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-white">{t.home.links}</p>
              <p><Link href={`/${lang}#iglesias`} className="hover:text-white">⛪ {u.web.churches}</Link></p>
              <p><Link href={`/${lang}/login`} className="hover:text-white">🔐 {u.web.members}</Link></p>
              <InstallApp t={pwa} variant="card" />
            </div>
          </div>
          <p className="border-t border-white/10 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} {s.name} · {s.verse}</p>
        </footer>
      </body>
    </html>
  );
}
