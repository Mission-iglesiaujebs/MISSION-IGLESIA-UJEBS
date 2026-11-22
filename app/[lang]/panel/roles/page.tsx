import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { roles } from "@/config/site";
import { getUi5 } from "@/lib/ui5-i18n";
import { createRole } from "@/app/actions5";

export const dynamic = "force-dynamic";

export default async function Roles({ params, searchParams }: { params: { lang: string }; searchParams: { error?: string } }) {
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi5(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (profile?.role !== "admin") return <p className="card">{u.roles.onlyAdmin}</p>;

  const [{ data: list }, { data: assigned }, { data: sites }] = await Promise.all([
    supabase.from("custom_roles").select("id, name, description, base_role, site_id, sites(name)").order("name"),
    supabase.from("profiles").select("custom_role_id").not("custom_role_id", "is", null),
    profile.site_id ? Promise.resolve({ data: [] }) : supabase.from("sites").select("id, name").order("name"),
  ]);
  const count = ((assigned ?? []) as { custom_role_id: string }[]).reduce<Record<string, number>>((a, r) => ((a[r.custom_role_id] = (a[r.custom_role_id] ?? 0) + 1), a), {});
  const rows = (list ?? []) as unknown as { id: string; name: string; description: string | null; base_role: string; site_id: string | null; sites: { name: string } | null }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🔐 {u.roles.title}</h1>
        <p className="max-w-2xl text-sm text-slate-500">{u.roles.desc}</p>
      </div>
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}

      <details className="card" open={rows.length === 0}>
        <summary className="cursor-pointer font-semibold">➕ {u.roles.newRole}</summary>
        <form action={createRole.bind(null, lang)} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div><label className="label">{u.roles.name}</label><input name="name" required minLength={2} maxLength={80} className="input" placeholder="Ej.: Líder de alabanza" /></div>
          <div>
            <label className="label">{u.roles.baseRole}</label>
            <select name="base_role" defaultValue="lider" className="input">
              {roles.map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">{u.roles.baseHint}</p>
          </div>
          <div className="sm:col-span-2"><label className="label">{u.roles.description}</label><input name="description" maxLength={500} className="input" /></div>
          {!profile.site_id && (
            <div>
              <label className="label">{u.roles.scope}</label>
              <select name="site_id" className="input">
                <option value="">{u.roles.global}</option>
                {((sites ?? []) as { id: string; name: string }[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2"><button className="btn">{u.roles.newRole}</button></div>
        </form>
      </details>

      {rows.length === 0 ? <p className="card text-sm text-slate-500">{u.roles.noRoles}</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Link key={r.id} href={`/${lang}/panel/roles/${r.id}`} className="card transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="font-bold">🔐 {r.name}</p>
              {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
              <p className="mt-3 text-xs text-slate-500">{u.roles.baseRole}: {t.roles[r.base_role as keyof typeof t.roles]} · {r.sites?.name ?? u.roles.global} · {count[r.id] ?? 0} {u.roles.users}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
