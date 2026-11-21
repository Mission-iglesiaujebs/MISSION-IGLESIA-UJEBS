import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { signIn, signUp } from "@/app/actions";

export default function Login({ params, searchParams }: { params: { lang: string }; searchParams: { mode?: string; error?: string; created?: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const isSignup = searchParams.mode === "signup";

  return (
    <div className="mx-auto max-w-sm card">
      <h1 className="mb-4 text-xl font-bold">{t.auth.title}</h1>
      {searchParams.error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{t.auth.error}</p>}
      {searchParams.created && <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700">{t.auth.checkEmail}</p>}
      <form action={(isSignup ? signUp : signIn).bind(null, lang)} className="space-y-3">
        {isSignup && (
          <div><label className="label">{t.auth.fullName}</label><input name="full_name" required className="input" /></div>
        )}
        <div><label className="label">{t.auth.email}</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">{t.auth.password}</label><input name="password" type="password" minLength={6} required className="input" /></div>
        <button className="btn w-full">{isSignup ? t.auth.signUp : t.auth.signIn}</button>
      </form>
      <p className="mt-4 text-center text-sm">
        {isSignup ? t.auth.haveAccount : t.auth.noAccount}{" "}
        <Link className="text-brand underline" href={`/${lang}/login${isSignup ? "" : "?mode=signup"}`}>
          {isSignup ? t.auth.signIn : t.auth.signUp}
        </Link>
      </p>
    </div>
  );
}
