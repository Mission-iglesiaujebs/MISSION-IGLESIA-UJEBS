import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile, isGlobal } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/catalog-db";
import { areaTitle, fieldLabel, VOCAB, type SysField } from "@/lib/catalog";
import { getUi5 } from "@/lib/ui5-i18n";
import { saveModule } from "@/app/actions5";

export const dynamic = "force-dynamic";
const LN = ["es", "fr", "ht", "en", "pt"] as const;
const TYPES = ["text", "textarea", "number", "date", "datetime", "bool", "url", "email", "select"] as const;

// Crear (sin parámetros), editar (?key=) o duplicar/reutilizar (?from=) un sistema
export default async function ModuleEditor({ params, searchParams }: { params: { lang: string }; searchParams: { key?: string; from?: string; area?: string } }) {
  const lang = params.lang;
  const u = getUi5(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (profile?.role !== "admin") return <p className="card">{u.mods.onlyAdmin}</p>;
  const cat = await getCatalog(supabase, profile);
  const editing = searchParams.key ? cat.allSystems.find((s) => s.key === searchParams.key) : undefined;
  const source = editing ?? (searchParams.from ? cat.allSystems.find((s) => s.key === searchParams.from) : undefined);
  if (editing && !isGlobal(profile) && !editing.custom) redirect(`/${lang}/panel/sistemas/gestionar?error=1`);

  const area = editing?.area ?? searchParams.area ?? source?.area ?? cat.areas[0]?.key;
  const labels = source ? source.labels.map((l) => (editing ? l : `${u.mods.copyOf} ${l}`.slice(0, 80))) : ["", "", "", "", ""];
  const std = new Set((source?.fields ?? []).filter((f) => !f.label).map((f) => f.key));
  const customs: (SysField | null)[] = [...(source?.fields ?? []).filter((f) => f.label), null, null, null, null].slice(0, 12);

  return (
    <div className="max-w-5xl space-y-5">
      <Link href={`/${lang}/panel/sistemas/gestionar`} className="text-sm text-brand">← {u.mods.manage}</Link>
      <h1 className="text-2xl font-bold">{editing ? `✏️ ${u.mods.editModule}` : `➕ ${u.mods.newModule}`}</h1>
      <form action={saveModule.bind(null, lang)} className="space-y-5">
        {editing && <input type="hidden" name="key" value={editing.key} />}
        <section className="card grid gap-3 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="label">{u.mods.area}</label>
            <select name="area" defaultValue={area} disabled={!!editing} className="input">
              {cat.areas.map((a) => <option key={a.key} value={a.key}>{a.icon} {areaTitle(a, lang)}</option>)}
            </select>
            {editing && <input type="hidden" name="area" value={editing.area} />}
          </div>
          <div><label className="label">{u.mods.icon}</label><input name="icon" defaultValue={source?.icon ?? "📄"} maxLength={8} className="input" /></div>
          {LN.map((l, i) => (
            <div key={l} className="sm:col-span-2"><label className="label">{u.mods.nameIn} {l.toUpperCase()}</label>
              <input name={`name_${l}`} defaultValue={labels[i]} maxLength={80} required={l === "es"} className="input" /></div>
          ))}
        </section>

        <section className="card">
          <h2 className="mb-3 font-bold">{u.mods.fields}</h2>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {VOCAB.map((v) => (
              <label key={v.key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <input type="checkbox" name="std" value={v.key} defaultChecked={std.has(v.key)} className="h-4 w-4" />
                {fieldLabel(v.key, lang)} <span className="text-xs text-slate-400">· {u.mods.types[v.type]}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-bold">{u.mods.customFields}</h2>
          <div className="space-y-2">
            {customs.map((f, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-6">
                {f && <input type="hidden" name={`cf_key_${i}`} value={f.key} />}
                <input name={`cf_label_${i}`} defaultValue={f?.label ?? ""} placeholder={u.mods.fieldLabel} maxLength={80} className="input sm:col-span-2" />
                <select name={`cf_type_${i}`} defaultValue={f?.type ?? "text"} className="input">
                  {TYPES.map((t) => <option key={t} value={t}>{u.mods.types[t]}</option>)}
                </select>
                <input name={`cf_opts_${i}`} defaultValue={f?.options?.join(", ") ?? ""} placeholder={u.mods.options} maxLength={1000} className="input sm:col-span-3" />
              </div>
            ))}
          </div>
        </section>
        <button className="btn px-8 py-3">💾 {u.mods.save}</button>
      </form>
    </div>
  );
}
