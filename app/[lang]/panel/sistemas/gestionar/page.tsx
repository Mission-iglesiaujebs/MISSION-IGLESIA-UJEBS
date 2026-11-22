import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile, isGlobal } from "@/lib/supabase/server";
import { getCatalog, type CatArea } from "@/lib/catalog-db";
import { sysTitle, areaTitle } from "@/lib/catalog";
import { getUi5 } from "@/lib/ui5-i18n";
import { saveArea, toggleArea, toggleModule, deleteModule } from "@/app/actions5";

export const dynamic = "force-dynamic";
const LN = ["es", "fr", "ht", "en", "pt"] as const;

function AreaForm({ lang, a, label }: { lang: string; a?: CatArea; label: string }) {
  const u = getUi5(lang);
  return (
    <form action={saveArea.bind(null, lang)} className="grid gap-2 sm:grid-cols-6">
      {a && <input type="hidden" name="key" value={a.key} />}
      <div><label className="label">{u.mods.icon}</label><input name="icon" defaultValue={a?.icon ?? "📁"} maxLength={8} className="input" /></div>
      {LN.map((l, i) => (
        <div key={l}><label className="label">{u.mods.nameIn} {l.toUpperCase()}</label>
          <input name={`name_${l}`} defaultValue={a?.label[i] ?? ""} maxLength={80} required={l === "es"} className="input" /></div>
      ))}
      <div className="sm:col-span-6"><button className="btn">{label}</button></div>
    </form>
  );
}

export default async function Manage({ params, searchParams }: { params: { lang: string }; searchParams: { ok?: string; error?: string } }) {
  const lang = params.lang;
  const u = getUi5(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (profile?.role !== "admin") return <p className="card">{u.mods.onlyAdmin}</p>;
  const global = isGlobal(profile);
  const cat = await getCatalog(supabase, profile);
  const areas = cat.allAreas;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/${lang}/panel/sistemas`} className="text-sm text-brand">← 🧩</Link>
          <h1 className="text-2xl font-bold">🛠 {u.mods.manage}</h1>
          <p className="max-w-2xl text-sm text-slate-500">{u.mods.manageDesc}</p>
        </div>
        <Link href={`/${lang}/panel/sistemas/gestionar/modulo`} className="btn">➕ {u.mods.newModule}</Link>
      </div>
      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {u.mods.saved}</p>}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{u.mods.error}</p>}

      {global && (
        <details className="card">
          <summary className="cursor-pointer font-semibold">➕ {u.mods.newArea}</summary>
          <div className="mt-4"><AreaForm lang={lang} label={u.mods.save} /></div>
        </details>
      )}

      <div className="space-y-3">
        {areas.map((a) => {
          const items = cat.allSystems.filter((s) => s.area === a.key);
          return (
            <details key={a.key} className={`card p-0 ${a.hidden ? "opacity-60" : ""}`}>
              <summary className="flex cursor-pointer items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-xl">{a.icon}</span>
                <span className="flex-1 font-semibold">{areaTitle(a, lang)}
                  <span className="ml-2 text-xs font-normal text-slate-500">{items.length} {u.mods.systems} · {a.custom ? u.mods.custom : u.mods.builtin}{a.hidden ? ` · ${u.mods.hiddenTag}` : ""}</span>
                </span>
                <Link href={`/${lang}/panel/sistemas/gestionar/modulo?area=${a.key}`} className="text-sm text-brand hover:underline">➕ {u.mods.newModule}</Link>
              </summary>
              <div className="space-y-4 border-t p-4">
                {global && (
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleArea.bind(null, lang, a.key, !a.hidden)}><button className="btn-ghost ring-1 ring-slate-200">{a.hidden ? `👁 ${u.mods.show}` : `🙈 ${u.mods.hide}`}</button></form>
                    <details className="w-full">
                      <summary className="btn-ghost inline-flex cursor-pointer ring-1 ring-slate-200">✏️ {u.mods.edit}</summary>
                      <div className="mt-3"><AreaForm lang={lang} a={a} label={u.mods.save} /></div>
                    </details>
                  </div>
                )}
                <ul className="divide-y text-sm">
                  {items.map((s) => (
                    <li key={s.key} className={`flex flex-wrap items-center gap-2 py-2 ${s.hidden ? "opacity-50" : ""}`}>
                      <span className="w-6 text-center">{s.icon}</span>
                      <Link href={`/${lang}/panel/sistemas/${s.key}`} className="flex-1 font-medium hover:text-brand">{sysTitle(s, lang)}</Link>
                      <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-500">{s.custom ? u.mods.custom : u.mods.builtin}{s.hidden ? ` · ${u.mods.hiddenTag}` : ""}</span>
                      {(!s.siteId || s.siteId === profile.site_id) && (global || s.custom) && (
                        <Link href={`/${lang}/panel/sistemas/gestionar/modulo?key=${s.key}`} className="text-brand hover:underline">{u.mods.edit}</Link>
                      )}
                      <Link href={`/${lang}/panel/sistemas/gestionar/modulo?from=${s.key}`} className="text-brand hover:underline">{u.mods.duplicate}</Link>
                      {global && (
                        <form action={toggleModule.bind(null, lang, s.key, !s.hidden)}><button className="text-slate-600 hover:underline">{s.hidden ? u.mods.show : u.mods.hide}</button></form>
                      )}
                      {s.custom && (global || s.siteId === profile.site_id) && (
                        <form action={deleteModule.bind(null, lang, s.key)}><button className="text-red-600 hover:underline">{u.mods.remove}</button></form>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
