import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { modules } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function Panel({ params }: { params: { lang: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);

  const counts = await Promise.all(
    modules.map(async (m) => {
      const { count } = await supabase.from(m.table).select("id", { count: "exact", head: true });
      return count ?? 0;
    })
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t.panel.title}</h1>
          <p className="text-sm text-slate-500">
            {t.panel.hello}, {profile?.full_name || user.email} · {t.panel.role}: <b>{profile ? t.roles[profile.role] : "—"}</b> · ⛪ {profile?.sites?.name ?? t.sites.general}
          </p>
        </div>
        {profile?.role === "admin" && <Link href={`/${lang}/panel/usuarios`} className="btn">⚙️ {t.nav.users}</Link>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => {
          const mt = t.modules[m.key as keyof typeof t.modules];
          return (
            <Link key={m.key} href={`/${lang}/panel/${m.key}`} className="card transition hover:ring-brand">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{m.icon}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{counts[i]} {t.common.records}</span>
              </div>
              <h2 className="mt-3 font-bold">{mt.title}</h2>
              <p className="text-sm text-slate-500">{mt.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
