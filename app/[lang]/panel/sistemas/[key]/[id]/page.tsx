import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getSystem, sysTitle, canWriteArea } from "@/lib/catalog";
import { SysForm } from "@/components/SysForm";
import { sysUpdate } from "@/app/actions4";

export const dynamic = "force-dynamic";

export default async function EditSystemRecord({ params, searchParams }: { params: { lang: string; key: string; id: string }; searchParams: { error?: string } }) {
  const sys = getSystem(params.key);
  if (!sys || !/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const lang = params.lang;
  const t = getDict(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (!canWriteArea(sys.area, profile?.role ?? null)) return <p className="card">{t.common.noAccess}</p>;

  const { data } = await supabase.from("records").select("id, site_id, data").eq("id", params.id).eq("module", sys.key).maybeSingle();
  if (!data) notFound();
  const general = !profile?.site_id;
  const { data: siteRows } = general ? await supabase.from("sites").select("id, name").order("name") : { data: null };

  return (
    <div className="space-y-4">
      <Link href={`/${lang}/panel/sistemas/${sys.key}`} className="text-sm text-brand">← {sysTitle(sys, lang)}</Link>
      <h1 className="text-2xl font-bold">{sys.icon} {t.common.edit}</h1>
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}
      <div className="card">
        <SysForm sys={sys} lang={lang} values={(data.data as Record<string, unknown>) ?? {}} siteValue={data.site_id as string | null}
          sites={(siteRows as { id: string; name: string }[] | null) ?? null}
          action={sysUpdate.bind(null, lang, sys.key, params.id)}
          labels={{ save: t.common.save, select: t.common.select, site: t.users.site, allSites: t.sites.allSites }} />
      </div>
    </div>
  );
}
