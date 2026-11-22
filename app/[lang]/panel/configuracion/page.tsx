import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile, isGlobal } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { getUi5, APP_VERSION } from "@/lib/ui5-i18n";
import { saveSettings } from "@/app/actions5";
import { UpdateApp } from "@/components/UpdateApp";

export const dynamic = "force-dynamic";

export default async function Settings({ params, searchParams }: { params: { lang: string }; searchParams: { ok?: string; error?: string } }) {
  const lang = params.lang;
  const u = getUi5(lang);
  const { user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const s = await getSettings();
  const canEdit = isGlobal(profile) && ["admin", "pastor"].includes(profile!.role);
  const F = ({ name, label, value, type = "text", max = 300 }: { name: string; label: string; value: string | null; type?: string; max?: number }) => (
    <div><label className="label">{label}</label><input name={name} type={type} defaultValue={value ?? ""} maxLength={max} disabled={!canEdit} className="input" /></div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⚙️ {u.cfg.title}</h1>
        <p className="text-sm text-slate-500">{u.cfg.desc}</p>
      </div>
      {searchParams.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {u.cfg.saved}</p>}
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{u.cfg.error}</p>}
      {!canEdit && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{u.cfg.onlyGlobal}</p>}

      <form action={saveSettings.bind(null, lang)} className="space-y-6">
        <section className="card space-y-4">
          <h2 className="font-bold">🖼 {u.cfg.logo}</h2>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand text-4xl text-brand-gold">
              {s.logo ? <img src={s.logo} alt="Logo" className="h-full w-full object-contain" /> : "✝"}
            </div>
            <div className="space-y-2 text-sm">
              <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" disabled={!canEdit} className="block text-sm" aria-label={u.cfg.uploadLogo} />
              <p className="text-xs text-slate-500">{u.cfg.logoHint}</p>
              {s.logo && <label className="flex items-center gap-2"><input type="checkbox" name="remove_logo" disabled={!canEdit} /> {u.cfg.removeLogo}</label>}
            </div>
          </div>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">✝ {u.cfg.identity}</h2>
          <F name="name" label={u.cfg.name} value={s.name} max={160} />
          <F name="short_name" label={u.cfg.shortName} value={s.shortName} max={40} />
          <F name="tagline" label={u.cfg.tagline} value={s.tagline} />
          <F name="verse" label={u.cfg.verse} value={s.verse} max={120} />
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">🎨 {u.cfg.colors}</h2>
          <div><label className="label">{u.cfg.primary}</label><input type="color" name="primary_color" defaultValue={s.primary} disabled={!canEdit} className="h-11 w-full cursor-pointer rounded-lg border" /></div>
          <div><label className="label">{u.cfg.accent}</label><input type="color" name="accent_color" defaultValue={s.accent} disabled={!canEdit} className="h-11 w-full cursor-pointer rounded-lg border" /></div>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">📞 {u.cfg.contact}</h2>
          <F name="email" label={u.cfg.email} value={s.email} type="email" max={200} />
          <F name="phone" label={u.cfg.phone} value={s.phone} max={60} />
          <F name="address" label={u.cfg.address} value={s.address} />
          <F name="whatsapp" label={u.cfg.whatsapp} value={s.whatsapp} max={60} />
          <F name="youtube" label={u.cfg.youtube} value={s.youtube} type="url" />
          <F name="facebook" label={u.cfg.facebook} value={s.facebook} type="url" />
          <F name="instagram" label={u.cfg.instagram} value={s.instagram} type="url" />
          <F name="live_url" label={u.cfg.liveUrl} value={s.liveUrl} type="url" />
        </section>
        {canEdit && <button className="btn px-8 py-3">💾 {u.mods.save}</button>}
      </form>

      <section className="card space-y-3">
        <h2 className="font-bold">🔄 {u.cfg.update}</h2>
        <p className="text-sm text-slate-500">{u.cfg.updateDesc} · {u.cfg.version} {APP_VERSION}</p>
        <UpdateApp labels={{ btn: u.cfg.updateBtn, busy: u.cfg.updating, done: u.cfg.updated }} />
      </section>

      {["admin", "pastor"].includes(profile?.role ?? "") && (
        <Link href={`/${lang}/panel/auditoria`} className="card flex items-center gap-3 hover:ring-brand">📜 <span><b>{u.cfg.audit}</b> — {u.cfg.auditDesc}</span></Link>
      )}
    </div>
  );
}
