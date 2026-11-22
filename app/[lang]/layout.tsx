import Link from "next/link";
import { notFound } from "next/navigation";
import { site, locales, localeNames } from "@/config/site";
import { getDict, isLocale } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const t = getDict(params.lang);
  const { user } = await getSessionProfile();
  const lang = params.lang;

  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 bg-brand/95 text-white shadow-md backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
            <Link href={`/${lang}`} className="mr-auto flex items-center gap-2 font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-brand-gold">✝</span>
              <span className="hidden sm:inline">{site.shortName}</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href={`/${lang}`} className="hidden rounded-lg px-3 py-1.5 hover:bg-white/10 sm:block">{t.nav.home}</Link>
              {user ? (
                <>
                  <Link href={`/${lang}/panel`} className="rounded-lg px-3 py-1.5 hover:bg-white/10">{t.nav.panel}</Link>
                  <form action={signOut.bind(null, lang)}>
                    <button className="rounded-lg px-3 py-1.5 hover:bg-white/10">{t.nav.logout}</button>
                  </form>
                </>
              ) : (
                <Link href={`/${lang}/login`} className="rounded-lg bg-brand-gold px-4 py-1.5 font-semibold text-brand">{t.nav.login}</Link>
              )}
            </nav>
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
        <footer className="bg-slate-900 text-slate-300">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 font-bold text-white"><span className="text-brand-gold">✝</span> {site.name}</p>
              <p className="mt-2 text-slate-400">{t.home.about}</p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-white">{t.home.contact}</p>
              <p>{site.address}</p>
              <p>{site.phone}</p>
              <p>{site.email}</p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-white">{t.home.links}</p>
              <p><Link href={`/${lang}#sedes`} className="hover:text-white">⛪ {t.sites.directory}</Link></p>
              <p><Link href={`/${lang}/login`} className="hover:text-white">🔐 {t.home.members}</Link></p>
              <p className="mt-2 flex gap-3">
                {locales.map((l) => <Link key={l} href={`/${l}`} className="uppercase hover:text-white">{l}</Link>)}
              </p>
            </div>
          </div>
          <p className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} {site.name}</p>
        </footer>
      </body>
    </html>
  );
}
