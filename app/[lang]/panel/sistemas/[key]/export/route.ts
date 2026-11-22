import { NextResponse } from "next/server";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { getSystem, fieldLabel, optionLabel, canReadArea } from "@/lib/catalog";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, { params }: { params: { lang: string; key: string } }) {
  const sys = getSystem(params.key);
  const { supabase, user, profile } = await getSessionProfile();
  if (!sys || !user || !canReadArea(sys.area, profile?.role ?? null)) return new NextResponse("Forbidden", { status: 403 });
  const t = getDict(params.lang);
  const { data } = await supabase.from("records").select("data, created_at").eq("module", sys.key).order("created_at", { ascending: false }).limit(10000);
  const lines = [sys.fields.map((f) => cell(fieldLabel(f.key, params.lang))).join(",")];
  for (const r of (data ?? []) as { data: Record<string, unknown> }[]) {
    lines.push(sys.fields.map((f) => {
      const v = r.data?.[f.key];
      if (f.type === "bool") return cell(v ? t.common.yes : t.common.no);
      if (f.type === "select" && v) return cell(optionLabel(String(v), params.lang));
      return cell(v);
    }).join(","));
  }
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${sys.key}.csv"`, "Cache-Control": "no-store" },
  });
}
