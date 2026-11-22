import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile, isGlobal } from "@/lib/supabase/server";
import { roles } from "@/config/site";
import { getUi5 } from "@/lib/ui5-i18n";
import { mediaUrl } from "@/lib/settings";
import { setUserAccess } from "@/app/actions5";

export const dynamic = "force-dynamic";

type U = { id: string; full_name: string | null; email: string | null; role: string; site_id: string | null; region_id: string | null; custom_role_id: string | null; avatar_path: string | null };

export default async function Users({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string } }) {
  const t = getDict(params.lang);
  const u5 = getUi5(params.lang);
  const lang = params.lang;
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (profile?.role !== "admin") return <p className="card">{t.users.onlyAdmin}</p>;
  const global = isGlobal(profile);
  const q = (searchParams.q ?? "").replace(/[%_,()]/g, "").trim().slice(0, 80);

  let query = supabase.from("profiles").select("id, full_name, email, role, site_id, region_id, custom_role_id, avatar_path").order("full_name").limit(500);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  const [{ data }, { data: siteRows }, { data: regionRows }, { data: roleRows }] = await Promise.all([
    query,
    supabase.from("sites").select("id, name").order("name"),
    supabase.from("regions").select("id, name").order("name"),
    supabase.from("custom_roles").select("id, name").order("name"),
  ]);
  const users = (data as U[]) ?? [];
  const sites = (siteRows as { id: string; name: string }[]) ?? [];
  const regions = (regionRows as { id: string; name: string }[]) ?? [];
  const customRoles = (roleRows as { id: string; name: string }[]) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">⚙️ {t.users.title}</h1>
        <Link href={`/${lang}/panel/roles`} className="btn-ghost ring-1 ring-slate-200">🔐 {u5.roles.title}</Link>
      </div>
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder={t.common.searchPh} maxLength={80} className="input w-72" /><button className="btn">{t.common.search}</button></form>
      <div className="space-y-3">
        {users.map((x) => {
          const avatar = mediaUrl(x.avatar_path);
          return (
            <form key={x.id} action={setUserAccess.bind(null, lang, x.id)} className="card flex flex-wrap items-end gap-3">
              <div className="flex min-w-56 flex-1 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/10">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : "👤"}</span>
                <div className="min-w-0"><p className="truncate font-medium">{x.full_name || "—"}</p><p className="truncate text-xs text-slate-500">{x.email}</p></div>
              </div>
              <div><label className="label">{u5.roles.baseRole}</label>
                <select name="role" defaultValue={x.role} className="input w-36">{roles.map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}</select></div>
              <div><label className="label">{u5.roles.customRole}</label>
                <select name="custom_role_id" defaultValue={x.custom_role_id ?? ""} className="input w-48">
                  <option value="">{u5.roles.none}</option>
                  {customRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select></div>
              {!profile.site_id && (
                <div><label className="label">{t.users.site}</label>
                  <select name="site_id" defaultValue={x.site_id ?? ""} className="input w-48">
                    {global ? <option value="">{t.sites.general}</option> : <option value="" disabled>{t.common.select}</option>}
                    {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
              )}
              {global && (
                <div><label className="label">{u5.roles.region} ({u5.roles.regional})</label>
                  <select name="region_id" defaultValue={x.region_id ?? ""} className="input w-44">
                    <option value="">{u5.roles.noRegion}</option>
                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select></div>
              )}
              <button className="btn">{t.common.save}</button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
