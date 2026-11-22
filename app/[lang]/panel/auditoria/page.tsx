import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getUi5 } from "@/lib/ui5-i18n";

export const dynamic = "force-dynamic";

type Ev = { id: number; at: string; actor: string | null; entity: string; entity_id: string | null; action: string };

export default async function Audit({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getDict(lang);
  const u = getUi5(lang);
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  if (!["admin", "pastor"].includes(profile?.role ?? "")) return <p className="card">{t.common.noAccess}</p>;

  const { data } = await supabase.from("audit_events").select("id, at, actor, entity, entity_id, action").order("at", { ascending: false }).limit(300);
  const events = (data ?? []) as Ev[];
  const ids = Array.from(new Set(events.map((e) => e.actor).filter(Boolean))) as string[];
  const { data: people } = ids.length ? await supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
  const who = new Map(((people ?? []) as { id: string; full_name: string | null; email: string | null }[]).map((p) => [p.id, p.full_name || p.email || "—"]));
  const verb = (a: string) => (a === "insert" ? `🟢 ${u.cfg.insert}` : a === "update" ? `🟡 ${u.cfg.update_}` : `🔴 ${u.cfg.delete}`);
  const mod = (e: string) => (t.modules as Record<string, { title: string }>)[e]?.title ?? e;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">📜 {u.cfg.audit}</h1>
        <p className="text-sm text-slate-500">{u.cfg.auditDesc}</p>
      </div>
      <div className="card overflow-x-auto p-0">
        {events.length === 0 ? <p className="p-5 text-sm text-slate-500">{t.common.empty}</p> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">{u.cfg.when}</th><th className="px-4 py-3">{u.cfg.who}</th><th className="px-4 py-3">{u.cfg.action}</th><th className="px-4 py-3">{u.cfg.what}</th></tr>
            </thead>
            <tbody className="divide-y">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500">{new Date(e.at).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-4 py-2">{e.actor ? who.get(e.actor) ?? "—" : "Sistema"}</td>
                  <td className="whitespace-nowrap px-4 py-2">{verb(e.action)}</td>
                  <td className="px-4 py-2">{mod(e.entity)} <span className="font-mono text-xs text-slate-400">{e.entity_id?.slice(0, 18)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
