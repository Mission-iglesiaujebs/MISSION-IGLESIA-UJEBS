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
      <body>
        <header className="bg-brand text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
            <Link href={`/${lang}`} className="mr-auto flex items-center gap-2 text-lg font-bold">
              <span className="text-brand-gold">✝</span> {site.shortName}
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href={`/${lang}`} className="rounded px-3 py-1.5 hover:bg-white/10">{t.nav.home}</Link>
              {user ? (
                <>
                  <Link href={`/${lang}/panel`} className="rounded px-3 py-1.5 hover:bg-white/10">{t.nav.panel}</Link>
                  <form action={signOut.bind(null, lang)}>
                    <button className="rounded px-3 py-1.5 hover:bg-white/10">{t.nav.logout}</button>
                  </form>
                </>
              ) : (
                <Link href={`/${lang}/login`} className="rounded bg-brand-gold px-3 py-1.5 font-semibold text-brand">{t.nav.login}</Link>
              )}
            </nav>
            <div className="flex gap-1 text-xs" aria-label={t.common.language}>
              {locales.map((l) => (
                <Link key={l} href={`/${l}`} title={localeNames[l]}
                  className={`rounded px-2 py-1 uppercase ${l === lang ? "bg-white text-brand" : "hover:bg-white/10"}`}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t bg-white py-6 text-center text-xs text-slate-500">
          {site.name} · {site.address} · {site.phone} · {site.email}
        </footer>
      </body>
    </html>
  );
}
