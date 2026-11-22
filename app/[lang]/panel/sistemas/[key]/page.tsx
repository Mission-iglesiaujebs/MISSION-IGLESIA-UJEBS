import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUi4 } from "@/lib/ui4-i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getSystem, getArea, sysTitle, areaTitle, fieldLabel, optionLabel, canReadArea, canWriteArea, type SysField } from "@/lib/catalog";
import { SysForm } from "@/components/SysForm";
import { sysCreate, sysDelete } from "@/app/actions4";

export const dynamic = "force-dynamic";

type Rec = { id: string; site_id: string | null; data: Record<string, unknown>; created_at: string };

export default async function SystemPage({ params, searchParams }: { params: { lang: string; key: string }; searchParams: { ok?: string; error?: string; q?: string; nuevo?: string } }) {
  const sys = getSystem(params.key);
  if (!sys) notFound();
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi4(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const role = profile?.role ?? null;
  if (!canReadArea(sys.area, role)) return <p className="card">{t.common.noAccess}</p>;
  const writer = canWriteArea(sys.area, role);
  const general = !profile?.site_id;
  const area = getArea(sys.area)!;

  const q = (searchParams.q ?? "").trim().slice(0, 100).replace(/[%_,()]/g, "");
  const searchField = sys.fields.find((f) => f.type === "text")?.key;
  let query = supabase.from("records").select("id, site_id, data, created_at").eq("module", sys.key).order("created_at", { ascending: false }).limit(500);
  if (q && searchField) query = query.ilike(`data->>${searchField}`, `%${q}%`);
  const { data } = await query;
  const rows = (data ?? []) as Rec[];

  const { data: siteRows } = general ? await supabase.from("sites").select("id, name").order("name") : { data: null };
  const sites = (siteRows as { id: string; name: string }[] | null) ?? null;
  const siteName = (id: string | null) => (id ? sites?.find((s) => s.id === id)?.name ?? "—" : t.sites.allSites);
  const cols = sys.fields.filter((f) => f.type !== "textarea").slice(0, 5);

  const show = (f: SysField, v: unknown) => {
    if (v === null || v === undefined || v === "") return "—";
    if (f.type === "bool") return v ? `✅ ${t.common.yes}` : t.common.no;
    if (f.type === "select") return optionLabel(String(v), lang);
    if (f.type === "datetime") return new Date(String(v)).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" });
    if (f.type === "number") return Number(v).toLocaleString(lang);
    if (f.type === "url") return <a href={String(v)} target="_blank" rel="noopener noreferrer" className="text-brand underline">🔗</a>;
    const s = String(v);
    return s.length > 60 ? s.slice(0, 60) + "…" : s;
  };
  const labels = { save: t.common.save, select: t.common.select, site: t.users.site, allSites: t.sites.allSites };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/${lang}/panel/sistemas`} className="text-sm text-brand">🧩 {u.sys.title} · {area.icon} {areaTitle(area, lang)}</Link>
          <h1 className="mt-1 text-2xl font-bold">{sys.icon} {sysTitle(sys, lang)}</h1>
          <p className="text-sm text-slate-500">{rows.length} {u.sys.records}{!writer && ` · ${u.sys.readOnly}`}</p>
        </div>
        <a href={`/${lang}/panel/sistemas/${sys.key}/export`} className="btn-ghost ring-1 ring-slate-200">⬇ {t.common.export}</a>
      </div>

      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {t.common.saved}</p>}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}

      {searchField && (
        <form className="flex flex-wrap gap-2 text-sm">
          <input name="q" defaultValue={q} placeholder={`${t.common.searchPh} (${fieldLabel(searchField, lang)})`} maxLength={100} className="input w-72" />
          <button className="btn">{t.common.search}</button>
        </form>
      )}

      {writer && (
        <details className="card" open={rows.length === 0 || !!searchParams.nuevo}>
          <summary className="cursor-pointer font-semibold">➕ {t.common.newRecord}</summary>
          <div className="mt-4">
            <SysForm sys={sys} lang={lang} action={sysCreate.bind(null, lang, sys.key)} sites={sites} labels={labels} />
          </div>
        </details>
      )}

      <div className="card overflow-x-auto p-0">
        {rows.length === 0 ? <p className="p-5 text-sm text-slate-500">{t.common.empty}</p> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {general && <th className="px-4 py-3">{t.users.site}</th>}
                {cols.map((f) => <th key={f.key} className="px-4 py-3">{fieldLabel(f.key, lang)}</th>)}
                {writer && <th className="px-4 py-3">{t.common.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {general && <td className="px-4 py-2 text-slate-500">{siteName(r.site_id)}</td>}
                  {cols.map((f) => <td key={f.key} className="px-4 py-2">{show(f, r.data?.[f.key])}</td>)}
                  {writer && (
                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <Link href={`/${lang}/panel/sistemas/${sys.key}/${r.id}`} className="text-brand hover:underline">{t.common.edit}</Link>
                        <form action={sysDelete.bind(null, lang, sys.key, r.id)}>
                          <button className="text-red-600 hover:underline">{t.common.delete}</button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
