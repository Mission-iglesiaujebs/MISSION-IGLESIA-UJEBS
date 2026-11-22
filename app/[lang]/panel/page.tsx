import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { modules, canSee, canCreate } from "@/lib/modules";
import { getUi4 } from "@/lib/ui4-i18n";
import { SYSTEMS, canReadArea } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Money = { amount: number; currency: string };
const sumBy = (rows: Money[]) =>
  rows.reduce<Record<string, number>>((a, r) => ((a[r.currency] = (a[r.currency] ?? 0) + Number(r.amount)), a), {});

export default async function Dashboard({ params }: { params: { lang: string } }) {
  const t = getDict(params.lang);
  const lang = params.lang;
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect(`/${lang}/login`);
  const role = profile?.role ?? null;
  const u4 = getUi4(lang);
  const isFinance = role === "tesorero" || role === "pastor" || role === "admin";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const [members, visitorsMonth, attendance, events, prayers, recentVisitors, birthdaysRaw, income, spent] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("visitors").select("id", { count: "exact", head: true }).gte("visit_date", monthStart),
    supabase.from("attendance").select("date,service,adults,children,visitors").order("date", { ascending: false }).limit(8),
    supabase.from("events").select("id,title,starts_at,location").gte("starts_at", now.toISOString()).order("starts_at").limit(5),
    supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("visitors").select("id,full_name,visit_date,status").order("visit_date", { ascending: false }).limit(5),
    supabase.from("members").select("id,full_name,birth_date").not("birth_date", "is", null).limit(2000),
    isFinance ? supabase.from("donations").select("amount,currency").gte("date", monthStart) : Promise.resolve({ data: [] }),
    isFinance ? supabase.from("expenses").select("amount,currency").gte("date", monthStart) : Promise.resolve({ data: [] }),
  ]);

  const att = ((attendance.data ?? []) as { date: string; service: string; adults: number | null; children: number | null; visitors: number | null }[])
    .map((a) => ({ ...a, total: (a.adults ?? 0) + (a.children ?? 0) + (a.visitors ?? 0) }))
    .reverse();
  const maxAtt = Math.max(1, ...att.map((a) => a.total));
  const last = att[att.length - 1];

  const month = now.getMonth() + 1;
  const birthdays = ((birthdaysRaw.data ?? []) as { id: string; full_name: string; birth_date: string }[])
    .filter((m) => Number(m.birth_date.slice(5, 7)) === month)
    .sort((a, b) => a.birth_date.slice(8, 10).localeCompare(b.birth_date.slice(8, 10)));

  const inc = sumBy((income.data ?? []) as Money[]);
  const exp = sumBy((spent.data ?? []) as Money[]);
  const currencies = Array.from(new Set([...Object.keys(inc), ...Object.keys(exp)]));
  const fmt = (n: number) => n.toLocaleString(lang, { maximumFractionDigits: 0 });

  const kpis = [
    { icon: "👥", label: t.dash.activeMembers, value: fmt(members.count ?? 0), href: "members" },
    { icon: "🤝", label: t.dash.visitorsMonth, value: fmt(visitorsMonth.count ?? 0), href: "visitors" },
    { icon: "📋", label: t.dash.lastAttendance, value: last ? fmt(last.total) : "—", href: "attendance" },
    { icon: "🙏", label: t.dash.pendingPrayers, value: fmt(prayers.count ?? 0), href: "prayer_requests" },
  ];

  const quick = modules.filter((m) => canSee(m, role) && canCreate(m, role)).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.panel.hello}, {profile?.full_name || user.email} 👋</h1>
        <p className="text-sm text-slate-500">{t.panel.title} · {profile ? t.roles[profile.role] : ""} · ⛪ {profile?.sites?.name ?? t.sites.general}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/${lang}/panel/aula`} className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light p-6 text-white shadow-md transition hover:-translate-y-0.5">
          <span className="text-5xl">🎓</span>
          <div><p className="text-xl font-bold">{u4.aula.title}</p><p className="text-sm text-white/80">{u4.aula.desc}</p></div>
        </Link>
        <Link href={`/${lang}/panel/sistemas`} className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-amber-500 to-brand-gold p-6 text-brand shadow-md transition hover:-translate-y-0.5">
          <span className="text-5xl">🧩</span>
          <div><p className="text-xl font-bold">{SYSTEMS.filter((s) => canReadArea(s.area, role)).length} · {u4.sys.title}</p><p className="text-sm">{u4.sys.desc}</p></div>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={`/${lang}/panel/${k.href}`} className="card group flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">{k.icon}</span>
            <div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {isFinance && (
        <section className="card">
          <h2 className="mb-3 font-bold">💰 {t.dash.balance}</h2>
          {currencies.length === 0 ? <p className="text-sm text-slate-500">{t.dash.noData}</p> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currencies.map((c) => {
                const bal = (inc[c] ?? 0) - (exp[c] ?? 0);
                return (
                  <div key={c} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">{c}</p>
                    <p className="mt-1 text-sm">⬆ {t.dash.incomeMonth}: <b className="text-emerald-700">{fmt(inc[c] ?? 0)}</b></p>
                    <p className="text-sm">⬇ {t.dash.expensesMonth}: <b className="text-rose-700">{fmt(exp[c] ?? 0)}</b></p>
                    <p className={`mt-1 text-lg font-bold ${bal >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{fmt(bal)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="mb-4 font-bold">📈 {t.dash.attendanceTrend}</h2>
          {att.length === 0 ? <p className="text-sm text-slate-500">{t.dash.noData}</p> : (
            <div className="flex h-48 items-end gap-2">
              {att.map((a, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${a.service}: ${a.total}`}>
                  <span className="text-xs font-semibold">{a.total}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-brand to-brand-light" style={{ height: `${(a.total / maxAtt) * 150}px` }} />
                  <span className="text-[10px] text-slate-500">{a.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-bold">🎂 {t.dash.birthdays}</h2>
          {birthdays.length === 0 ? <p className="text-sm text-slate-500">{t.dash.noBirthdays}</p> : (
            <ul className="max-h-52 space-y-2 overflow-y-auto text-sm">
              {birthdays.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>{b.full_name}</span>
                  <span className="rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800">{b.birth_date.slice(8, 10)}/{b.birth_date.slice(5, 7)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-bold">📅 {t.dash.upcoming}</h2>
          {(events.data ?? []).length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="divide-y text-sm">
              {(events.data as { id: string; title: string; starts_at: string; location: string | null }[]).map((e) => (
                <li key={e.id} className="flex justify-between gap-2 py-2">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-right text-slate-500">{new Date(e.starts_at).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-bold">🤝 {t.dash.recentVisitors}</h2>
          {(recentVisitors.data ?? []).length === 0 ? <p className="text-sm text-slate-500">{t.common.empty}</p> : (
            <ul className="divide-y text-sm">
              {(recentVisitors.data as { id: string; full_name: string; visit_date: string; status: string }[]).map((v) => (
                <li key={v.id} className="flex justify-between py-2">
                  <span>{v.full_name}</span>
                  <span className="text-slate-500">{v.visit_date} · {t.options[v.status] ?? v.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {quick.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">⚡ {t.dash.quick}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quick.map((m) => (
              <Link key={m.key} href={`/${lang}/panel/${m.key}?nuevo=1`} className="card flex items-center gap-2 py-3 text-sm font-medium hover:ring-brand">
                <span className="text-xl">{m.icon}</span> {t.modules[m.key as keyof typeof t.modules].title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
