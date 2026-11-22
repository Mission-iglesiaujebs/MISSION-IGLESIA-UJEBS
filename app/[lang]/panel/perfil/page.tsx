import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { updateName, changePassword } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Profile({ params, searchParams }: { params: { lang: string }; searchParams: { name?: string; pw?: string; pwerr?: string; reset?: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const { user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">👤 {t.profile.title}</h1>

      <section className="card space-y-3">
        <h2 className="font-bold">{t.profile.account}</h2>
        <p className="text-sm text-slate-500">{user.email} · {profile ? t.roles[profile.role] : ""} · ⛪ {profile?.sites?.name ?? t.sites.general}</p>
        {searchParams.name && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">✓ {t.profile.nameSaved}</p>}
        <form action={updateName.bind(null, lang)} className="flex flex-wrap gap-2">
          <input name="full_name" defaultValue={profile?.full_name ?? ""} maxLength={120} required className="input flex-1" aria-label={t.profile.name} />
          <button className="btn">{t.profile.saveName}</button>
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
