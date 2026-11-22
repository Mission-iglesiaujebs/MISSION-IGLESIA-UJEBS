import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { changePassword } from "@/app/actions";
import { saveProfile } from "@/app/actions5";
import { getUi5 } from "@/lib/ui5-i18n";
import { mediaUrl } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Profile({ params, searchParams }: { params: { lang: string }; searchParams: { name?: string; pw?: string; pwerr?: string; reset?: string; photoerr?: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const { user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const u = getUi5(lang);
  const avatar = mediaUrl(profile?.avatar_path);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">👤 {t.profile.title}</h1>

      <section className="card space-y-3">
        <h2 className="font-bold">{t.profile.account}</h2>
        <p className="text-sm text-slate-500">{user.email} · {profile ? t.roles[profile.role] : ""} · ⛪ {profile?.sites?.name ?? profile?.regions?.name ?? t.sites.general}{profile?.custom_roles ? ` · 🔐 ${profile.custom_roles.name}` : ""}</p>
        {searchParams.name && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">✓ {u.profile.saved}</p>}
        {searchParams.photoerr && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{u.profile.error}</p>}
        <form action={saveProfile.bind(null, lang)} className="space-y-4">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand/10 text-4xl ring-4 ring-brand-gold/40">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : "👤"}
            </div>
            <div className="space-y-2 text-sm">
              <label className="label">{u.profile.photo}</label>
              <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" className="block text-sm" aria-label={u.profile.upload} />
              {avatar && <label className="flex items-center gap-2"><input type="checkbox" name="remove_avatar" /> {u.profile.remove}</label>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">{t.profile.name}</label><input name="full_name" defaultValue={profile?.full_name ?? ""} maxLength={120} required className="input" /></div>
            <div><label className="label">{u.profile.phone}</label><input name="phone" defaultValue={profile?.phone ?? ""} maxLength={60} className="input" /></div>
          </div>
          <button className="btn">💾 {u.profile.save}</button>
        </form>
      </section>

      <section className={`card space-y-3 ${searchParams.reset ? "ring-2 ring-brand" : ""}`}>
        <h2 className="font-bold">🔒 {t.profile.security}</h2>
        {searchParams.pw && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">✓ {t.profile.passwordChanged}</p>}
        {searchParams.pwerr && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{t.profile.passwordMismatch}</p>}
        <form action={changePassword.bind(null, lang)} className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">{t.profile.newPassword}</label><input name="password" type="password" minLength={8} required autoComplete="new-password" className="input" /></div>
          <div><label className="label">{t.profile.confirmPassword}</label><input name="confirm" type="password" minLength={8} required autoComplete="new-password" className="input" /></div>
          <div className="sm:col-span-2"><button className="btn">{t.profile.changePassword}</button></div>
        </form>
      </section>
    </div>
  );
}
