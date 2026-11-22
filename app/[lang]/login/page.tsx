import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { signIn, signUp, forgotPassword } from "@/app/actions";
import { site } from "@/config/site";

export default function Login({ params, searchParams }: { params: { lang: string }; searchParams: { mode?: string; error?: string; created?: string; sent?: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const mode = searchParams.mode === "signup" ? "signup" : searchParams.mode === "forgot" ? "forgot" : "login";

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand to-brand-light p-10 text-white md:flex">
        <span className="text-4xl text-brand-gold">✝</span>
        <div>
          <p className="text-2xl font-bold leading-tight">{site.name}</p>
          <p className="mt-3 text-sm text-white/80">{t.home.about}</p>
        </div>
        <p className="text-sm text-brand-gold">{site.verse}</p>
      </div>
      <div className="p-8 md:p-10">
        <h1 className="mb-6 text-2xl font-bold">{mode === "forgot" ? t.auth.forgotTitle : t.auth.title}</h1>
        {searchParams.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.auth.error}</p>}
        {searchParams.created && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{t.auth.checkEmail}</p>}
        {searchParams.sent && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{t.auth.linkSent}</p>}

        {mode === "forgot" ? (
          <form action={forgotPassword.bind(null, lang)} className="space-y-4">
            <div><label className="label">{t.auth.email}</label><input name="email" type="email" required className="input" /></div>
            <button className="btn w-full">{t.auth.sendLink}</button>
            <p className="text-center text-sm"><Link className="text-brand underline" href={`/${lang}/login`}>{t.auth.backToLogin}</Link></p>
          </form>
        ) : (
          <>
            <form action={(mode === "signup" ? signUp : signIn).bind(null, lang)} className="space-y-4">
              {mode === "signup" && (
                <div><label className="label">{t.auth.fullName}</label><input name="full_name" required className="input" /></div>
              )}
              <div><label className="label">{t.auth.email}</label><input name="email" type="email" required autoComplete="email" className="input" /></div>
              <div>
                <label className="label">{t.auth.password}</label>
                <input name="password" type="password" minLength={mode === "signup" ? 8 : 6} required autoComplete={mode === "signup" ? "new-password" : "current-password"} className="input" />
              </div>
              <button className="btn w-full py-2.5">{mode === "signup" ? t.auth.signUp : t.auth.signIn}</button>
            </form>
            {mode === "login" && (
              <p className="mt-3 text-center text-sm"><Link className="text-slate-500 hover:text-brand hover:underline" href={`/${lang}/login?mode=forgot`}>{t.auth.forgot}</Link></p>
            )}
            <p className="mt-4 text-center text-sm">
              {mode === "signup" ? t.auth.haveAccount : t.auth.noAccount}{" "}
              <Link className="text-brand underline" href={`/${lang}/login${mode === "signup" ? "" : "?mode=signup"}`}>
                {mode === "signup" ? t.auth.signIn : t.auth.signUp}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
