import { NextResponse } from "next/server";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getModule, canSee } from "@/lib/modules";
import { loadRefOptions } from "@/lib/refs";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Evita fórmulas en Excel y escapa comillas
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request, { params }: { params: { lang: string; module: string } }) {
  const mod = getModule(params.module);
  const { supabase, user, profile } = await getSessionProfile();
  if (!mod || !user || !canSee(mod, profile?.role ?? null)) return new NextResponse("Forbidden", { status: 403 });
  const t = getDict(params.lang);
  const mt = t.modules[mod.key as keyof typeof t.modules];
  const labels = mt.fields as Record<string, string>;

  let query = supabase.from(mod.table).select("*").order(mod.order.column, { ascending: mod.order.ascending }).limit(10000);
  const sede = new URL(req.url).searchParams.get("sede");
  if (sede && !profile?.site_id && mod.fields.some((f) => f.key === "site_id")) query = query.eq("site_id", sede);
  const { data } = await query;
  const refs = await loadRefOptions(supabase, mod);

  const lines = [mod.fields.map((f) => cell(labels[f.key] ?? f.key)).join(",")];
  for (const r of (data ?? []) as Record<string, unknown>[]) {
    lines.push(mod.fields.map((f) => {
      const v = r[f.key];
      if (f.type === "ref") return cell(refs[f.key]?.find((o) => o.id === v)?.label ?? "");
      if (f.type === "select" && v) return cell(t.options[String(v)] ?? v);
      if (f.type === "bool") return cell(v ? t.common.yes : t.common.no);
      return cell(v);
    }).join(","));
  }
  const name = `${mod.key}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  });
}
