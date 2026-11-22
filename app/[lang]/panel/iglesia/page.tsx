import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile, isGlobal } from "@/lib/supabase/server";
import { getUi5 } from "@/lib/ui5-i18n";
import { mediaUrl } from "@/lib/settings";
import { saveChurch } from "@/app/actions5";

export const dynamic = "force-dynamic";

// Página pública propia de cada iglesia: logo, portada, presentación, horarios y redes
export default async function ChurchPage({ params, searchParams }: { params: { lang: string }; searchParams: { id?: string; ok?: string; error?: string } }) {
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi5(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (!["secretaria", "pastor", "admin"].includes(profile?.role ?? "")) return <p className="card">{t.common.noAccess}</p>;

  const [{ data: siteRows }, { data: regionRows }] = await Promise.all([
    supabase.from("sites").select("id, name, country, city").order("country").order("name"),
    supabase.from("regions").select("id, name").order("name"),
  ]);
  const sites = ((siteRows ?? []) as { id: string; name: string; country: string; city: string }[]);
  const id = profile!.site_id ?? (searchParams.id && sites.some((s) => s.id === searchParams.id) ? searchParams.id : null);

  if (!id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">⛪ {u.church.title}</h1>
        <p className="text-sm text-slate-500">{u.church.desc}</p>
        <h2 className="font-semibold">{u.church.choose}</h2>
        {sites.length === 0 ? <p className="card text-sm text-slate-500">{t.sites.noSites}</p> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((s) => (
              <Link key={s.id} href={`/${lang}/panel/iglesia?id=${s.id}`} className="card hover:ring-brand">⛪ <b>{s.name}</b><p className="text-xs text-slate-500">{s.city}, {s.country}</p></Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { data: c } = await supabase.from("sites").select("*").eq("id", id).maybeSingle();
  if (!c) return <p className="card">{t.common.noAccess}</p>;
  const logo = mediaUrl(c.logo_path);
  const cover = mediaUrl(c.cover_path);
  const F = ({ name, label, type = "text", max = 300 }: { name: string; label: string; type?: string; max?: number }) => (
    <div><label className="label">{label}</label><input name={name} type={type} defaultValue={(c as Record<string, string | null>)[name] ?? ""} maxLength={max} className="input" /></div>
  );

  return (
    <div className="max-w-4xl space-y-5">
      {!profile!.site_id && <Link href={`/${lang}/panel/iglesia`} className="text-sm text-brand">← {u.church.choose}</Link>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">⛪ {c.name}</h1>
        <Link href={`/${lang}/iglesia/${c.id}`} target="_blank" className="btn-ghost ring-1 ring-slate-200">🌐 {u.church.view}</Link>
      </div>
      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {u.church.saved}</p>}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}

      <form action={saveChurch.bind(null, lang, c.id)} className="space-y-5">
        <section className="card grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="label">{u.church.logo}</label>
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand text-3xl text-brand-gold">{logo ? <img src={logo} alt="" className="h-full w-full object-contain" /> : "⛪"}</div>
            <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" className="block text-sm" />
          </div>
          <div className="space-y-2">
            <label className="label">{u.church.cover}</label>
            <div className="h-24 overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-light">{cover && <img src={cover} alt="" className="h-full w-full object-cover" />}</div>
            <input type="file" name="cover" accept="image/png,image/jpeg,image/webp" className="block text-sm" />
          </div>
        </section>
        <section className="card grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">{u.church.about}</label><textarea name="about" rows={5} maxLength={5000} defaultValue={c.about ?? ""} className="input" /></div>
          <F name="pastor_name" label={u.web.pastor} max={120} />
          <F name="schedule" label={u.web.schedule} />
          <F name="address" label={u.cfg.address} />
          <F name="phone" label={u.cfg.phone} max={60} />
          <F name="email" label={u.cfg.email} type="email" max={200} />
          <F name="whatsapp" label={u.cfg.whatsapp} max={60} />
          <F name="youtube" label={u.cfg.youtube} type="url" />
          <F name="facebook" label={u.cfg.facebook} type="url" />
          <F name="instagram" label={u.cfg.instagram} type="url" />
          {isGlobal(profile) && (
            <div><label className="label">{u.church.region}</label>
              <select name="region_id" defaultValue={c.region_id ?? ""} className="input">
                <option value="">{u.roles.noRegion}</option>
                {((regionRows ?? []) as { id: string; name: string }[]).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select></div>
          )}
          <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" name="published" defaultChecked={!!c.published} className="h-4 w-4" /> {t.modules.sites.fields.published}</label>
        </section>
        <button className="btn px-8 py-3">💾 {u.mods.save}</button>
      </form>
    </div>
  );
}
