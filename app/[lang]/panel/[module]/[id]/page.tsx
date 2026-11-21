import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getModule, canWrite } from "@/lib/modules";
import { loadRefOptions } from "@/lib/refs";
import { RecordForm } from "@/components/RecordForm";
import { updateRecord } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function EditPage({ params, searchParams }: { params: { lang: string; module: string; id: string }; searchParams: { error?: string } }) {
  const mod = getModule(params.module);
  if (!mod || !/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const t = getDict(params.lang);
  const lang = params.lang;
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (!canWrite(mod, profile?.role ?? null)) return <p className="card">{t.common.noAccess}</p>;

  const { data } = await supabase.from(mod.table).select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const refOptions = await loadRefOptions(supabase, mod);
  const mt = t.modules[mod.key as keyof typeof t.modules];

  return (
    <div className="space-y-4">
      <Link href={`/${lang}/panel/${mod.key}`} className="text-sm text-brand">← {mt.title}</Link>
      <h1 className="text-2xl font-bold">{mod.icon} {t.common.edit}</h1>
      {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.common.saveError}</p>}
      <div className="card">
        <RecordForm mod={mod} t={t} refOptions={refOptions} values={data as Record<string, unknown>}
          action={updateRecord.bind(null, lang, mod.key, params.id)} writer hideSite={!!profile?.site_id} />
      </div>
    </div>
  );
}
