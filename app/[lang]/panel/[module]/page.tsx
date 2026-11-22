import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getModule, canCreate, canWrite, canSee, type Field } from "@/lib/modules";
import { loadRefOptions } from "@/lib/refs";
import { RecordForm } from "@/components/RecordForm";
import { createRecord, deleteRecord } from "@/app/actions";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown> & { id: string };

export default async function ModulePage({ params, searchParams }: { params: { lang: string; module: string }; searchParams: { ok?: string; error?: string; sede?: string; q?: string; nuevo?: string } }) {
  const mod = getModule(params.module);
  if (!mod) notFound();
  const t = getDict(params.lang);
  const lang = params.lang;
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);

  const role = profile?.role ?? null;
  if (!canSee(mod, role)) return <p className="card">{t.common.noAccess}</p>;
  const q = (searchParams.q ?? "").trim().slice(0, 100);
  const general = !profile?.site_id;
  const mt = t.modules[mod.key as keyof typeof t.modules];
  const label = (k: string) => (mt.fields as Record<string, string>)[k] ?? k;
  const opt = (v: string) => t.options[v] ?? v;

  const hasSite = mod.fields.some((f) => f.key === "site_id");
  let query = supabase.from(mod.table).select("*").order(mod.order.column, { ascending: mod.order.ascending }).limit(500);
  if (hasSite && general && searchParams.sede) query = query.eq("site_id", searchParams.sede);
  if (q) query = query.ilike(mod.search, `%${q.replace(/[%_]/g, "")}%`);
  const { data, error } = await query;
  const rows = (data as Row[]) ?? [];

  const refOptions = await loadRefOptions(supabase, mod);
  const listFields = mod.fields.filter((f) => f.list && !(f.key === "site_id" && !general));
  const writer = canWrite(mod, role);
  const creator = canCreate(mod, role) && !(mod.key === "sites" && !general);

  const show = (f: Field, v: unknown) => {
    if (v === null || v === undefined || v === "") return f.key === "site_id" ? t.sites.allSites : "—";
    if (f.type === "bool") return v ? `✅ ${t.common.yes}` : t.common.no;
    if (f.type === "select") return opt(String(v));
    if (f.type === "ref") return refOptions[f.key]?.find((o) => o.id === v)?.label ?? "—";
    if (f.type === "datetime") return new Date(String(v)).toLocaleString(lang);
    if (f.type === "number") return Number(v).toLocaleString(lang);
    if (f.type === "url") return <a href={String(v)} target="_blank" className="text-brand underline">🔗</a>;
    const s = String(v);
    return s.length > 80 ? s.slice(0, 80) + "…" : s;
  };

  const totals = ["donations", "expenses"].includes(mod.key)
    ? Object.entries(rows.reduce<Record<string, number>>((acc, r) => {
        const c = String(r.currency ?? "");
        acc[c] = (acc[c] ?? 0) + Number(r.amount ?? 0);
        return acc;
      }, {}))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{mod.icon} {mt.title}</h1>
          <p className="text-sm text-slate-500">{mt.desc}{profile?.sites?.name && <> · ⛪ {profile.sites.name}</>} · {rows.length} {t.common.records}</p>
        </div>
        <a href={`/${lang}/panel/${mod.key}/export${searchParams.sede ? `?sede=${encodeURIComponent(searchParams.sede)}` : ""}`} className="btn-ghost ring-1 ring-slate-200">⬇ {t.common.export}</a>
      </div>

      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {t.common.saved}</p>}
      {(error || searchParams.error) && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error ? t.common.noAccess : t.common.saveError}</p>}

      <form className="flex flex-wrap items-center gap-2 text-sm">
        <input name="q" defaultValue={q} placeholder={t.common.searchPh} maxLength={100} className="input w-64" />
        {hasSite && general && (refOptions.site_id?.length ?? 0) > 0 && (
          <select name="sede" defaultValue={searchParams.sede ?? ""} className="input w-auto" aria-label={t.sites.filter}>
            <option value="">⛪ {t.common.all}</option>
            {refOptions.site_id.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        )}
        <button className="btn">{t.common.search}</button>
      </form>

      {creator && (
        <details id="nuevo" className="card" open={rows.length === 0 || !!searchParams.nuevo}>
          <summary className="cursor-pointer font-semibold">➕ {t.common.newRecord}</summary>
          <div className="mt-4">
            <RecordForm mod={mod} t={t} refOptions={refOptions} action={createRecord.bind(null, lang, mod.key)} writer={writer} hideSite={!general} />
          </div>
        </details>
      )}

      {totals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {totals.map(([c, v]) => (
            <div key={c} className="card py-3"><span className="text-xs text-slate-500">{t.common.total} {c}</span><p className="text-xl font-bold">{v.toLocaleString(lang)}</p></div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        {rows.length === 0 ? <p className="p-5 text-sm text-slate-500">{t.common.empty}</p> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {listFields.map((f) => <th key={f.key} className="px-4 py-3">{label(f.key)}</th>)}
                {writer && <th className="px-4 py-3">{t.common.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {listFields.map((f) => <td key={f.key} className="px-4 py-2">{show(f, r[f.key])}</td>)}
                  {writer && (
                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <Link href={`/${lang}/panel/${mod.key}/${r.id}`} className="text-brand hover:underline">{t.common.edit}</Link>
                        <form action={deleteRecord.bind(null, lang, mod.key, r.id)}>
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
