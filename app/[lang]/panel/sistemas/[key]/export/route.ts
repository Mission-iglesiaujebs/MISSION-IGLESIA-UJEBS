import { NextResponse } from "next/server";
import { getDict } from "@/lib/i18n";
import { getSessionProfile } from "@/lib/supabase/server";
import { fLabel, optionLabel } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-db";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, { params }: { params: { lang: string; key: string } }) {
  const { supabase, user, profile } = await getSessionProfile();
  const cat = await getCatalog(supabase, profile);
  const sys = cat.getSystem(params.key);
  if (!sys || !user || !cat.canRead(sys.area)) return new NextResponse("Forbidden", { status: 403 });
  const t = getDict(params.lang);
  const { data } = await supabase.from("records").select("data, created_at").eq("module", sys.key).order("created_at", { ascending: false }).limit(10000);
  const lines = [sys.fields.map((f) => cell(fLabel(f, params.lang))).join(",")];
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
