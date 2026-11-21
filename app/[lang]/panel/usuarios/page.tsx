import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { roles } from "@/config/site";
import { setRole } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Users({ params }: { params: { lang: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (profile?.role !== "admin") return <p className="card">{t.users.onlyAdmin}</p>;

  const { data } = await supabase.from("profiles").select("id, full_name, email, role, site_id").order("full_name");
  const users = (data as { id: string; full_name: string | null; email: string | null; role: string; site_id: string | null }[]) ?? [];
  const { data: siteRows } = await supabase.from("sites").select("id, name").order("name");
  const sites = (siteRows as { id: string; name: string }[]) ?? [];

  return (
    <div className="space-y-4">
      <Link href={`/${lang}/panel`} className="text-sm text-brand">← {t.common.back}</Link>
      <h1 className="text-2xl font-bold">⚙️ {t.users.title}</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium">{u.full_name || "—"}</td>
                <td className="px-4 py-2 text-slate-500">{u.email}</td>
                <td className="px-4 py-2">
                  <form action={setRole.bind(null, lang, u.id)} className="flex gap-2">
                    <select name="role" defaultValue={u.role} className="input w-40">
                      {roles.map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}
                    </select>
                    {!profile.site_id && (
                      <select name="site_id" defaultValue={u.site_id ?? ""} className="input w-52" aria-label={t.users.site}>
                        <option value="">{t.sites.general}</option>
                        {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    )}
                    <button className="btn-ghost">{t.users.changeRole}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
