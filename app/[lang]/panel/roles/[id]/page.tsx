import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { roles } from "@/config/site";
import { getCatalog } from "@/lib/catalog-db";
import { areaTitle } from "@/lib/catalog";
import { getUi5 } from "@/lib/ui5-i18n";
import { saveRolePerms, deleteRole } from "@/app/actions5";

export const dynamic = "force-dynamic";

export default async function RolePerms({ params, searchParams }: { params: { lang: string; id: string }; searchParams: { ok?: string; error?: string } }) {
  const { lang, id } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = getDict(lang);
  const u = getUi5(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (profile?.role !== "admin") return <p className="card">{u.roles.onlyAdmin}</p>;

  const [{ data: role }, { data: perms }, cat] = await Promise.all([
    supabase.from("custom_roles").select("*").eq("id", id).maybeSingle(),
    supabase.from("role_area_perms").select("area, can_read, can_write").eq("role_id", id),
    getCatalog(supabase, profile),
  ]);
  if (!role) notFound();
  const map = new Map(((perms ?? []) as { area: string; can_read: boolean; can_write: boolean }[]).map((p) => [p.area, p]));
  const areas = cat.areas;

  return (
    <div className="max-w-4xl space-y-5">
      <Link href={`/${lang}/panel/roles`} className="text-sm text-brand">← {u.roles.title}</Link>
      <h1 className="text-2xl font-bold">🔐 {role.name}</h1>
      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {t.common.saved}</p>}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}

      <form action={saveRolePerms.bind(null, lang, id)} className="space-y-5">
        <input type="hidden" name="areas" value={areas.map((a) => a.key).join(",")} />
        <section className="card grid gap-3 sm:grid-cols-2">
          <div><label className="label">{u.roles.name}</label><input name="name" defaultValue={role.name} required minLength={2} maxLength={80} className="input" /></div>
          <div>
            <label className="label">{u.roles.baseRole}</label>
            <select name="base_role" defaultValue={role.base_role} className="input">
              {roles.map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">{u.roles.description}</label><input name="description" defaultValue={role.description ?? ""} maxLength={500} className="input" /></div>
          <p className="text-xs text-slate-500 sm:col-span-2">{u.roles.baseHint}</p>
        </section>

        <section className="card overflow-x-auto p-0">
          <h2 className="p-4 font-bold">{u.roles.perms}</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-2">{u.roles.area}</th><th className="px-4 py-2 text-center">👁 {u.roles.read}</th><th className="px-4 py-2 text-center">✏️ {u.roles.write}</th></tr>
            </thead>
            <tbody className="divide-y">
              {areas.map((a) => {
                const p = map.get(a.key);
                return (
                  <tr key={a.key} className="hover:bg-slate-50">
                    <td className="px-4 py-2">{a.icon} {areaTitle(a, lang)}</td>
                    <td className="px-4 py-2 text-center"><input type="checkbox" name={`r_${a.key}`} defaultChecked={!!p?.can_read} className="h-4 w-4" aria-label={`${u.roles.read} ${a.key}`} /></td>
                    <td className="px-4 py-2 text-center"><input type="checkbox" name={`w_${a.key}`} defaultChecked={!!p?.can_write} className="h-4 w-4" aria-label={`${u.roles.write} ${a.key}`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <button className="btn px-8 py-3">💾 {u.roles.save}</button>
      </form>

      <form action={deleteRole.bind(null, lang, id)}>
        <button className="text-sm text-red-600 hover:underline">🗑 {u.roles.del}</button>
      </form>
    </div>
  );
}
