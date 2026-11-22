import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { modules, groups, canSee } from "@/lib/modules";
import { getUi4 } from "@/lib/ui4-i18n";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const { user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const role = profile?.role ?? null;
  const u = getUi4(lang);

  const nav = (
    <nav className="space-y-5 text-sm">
      <div className="space-y-0.5">
        <Link href={`/${lang}/panel`} className="side-link">📊 {t.nav.dashboard}</Link>
        <Link href={`/${lang}/panel/aula`} className="side-link font-semibold text-brand">🎓 {u.aula.title}</Link>
        <Link href={`/${lang}/panel/sistemas`} className="side-link font-semibold text-brand">🧩 {u.sys.title}</Link>
        <Link href={`/${lang}/panel/perfil`} className="side-link">👤 {t.nav.profile}</Link>
        {role === "admin" && <Link href={`/${lang}/panel/usuarios`} className="side-link">⚙️ {t.nav.users}</Link>}
      </div>
      {groups.map((g) => {
        const items = modules.filter((m) => m.group === g && canSee(m, role));
        if (items.length === 0) return null;
        return (
          <div key={g}>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.groups[g]}</p>
            <div className="space-y-0.5">
              {items.map((m) => (
                <Link key={m.key} href={`/${lang}/panel/${m.key}`} className="side-link">
                  <span className="w-5 text-center">{m.icon}</span> {t.modules[m.key as keyof typeof t.modules].title}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-64px)] md:mx-0">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-6 md:block">
        <div className="mb-5 rounded-xl bg-slate-50 px-3 py-3">
          <p className="truncate text-sm font-semibold">{profile?.full_name || user.email}</p>
          <p className="text-xs text-slate-500">{profile ? t.roles[profile.role] : "—"} · {profile?.sites?.name ?? t.sites.general}</p>
        </div>
        {nav}
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <details className="mb-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:hidden">
          <summary className="cursor-pointer text-sm font-semibold">☰ {t.nav.menu}</summary>
          <div className="mt-3">{nav}</div>
        </details>
        {children}
      </div>
    </div>
  );
}
