import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModuleDef } from "@/lib/modules";
import type { RefOptions } from "@/components/RecordForm";

// Opciones de campos relacionados (sede, célula, ministerio, miembro). RLS filtra por sede.
export async function loadRefOptions(supabase: SupabaseClient, mod: ModuleDef): Promise<RefOptions> {
  const out: RefOptions = {};
  for (const f of mod.fields.filter((f) => f.type === "ref")) {
    const { data } = await supabase.from(f.ref!.table).select(`id, ${f.ref!.label}`).order(f.ref!.label);
    out[f.key] = ((data as unknown as Record<string, string>[]) ?? []).map((r) => ({ id: r.id, label: r[f.ref!.label] }));
  }
  return out;
}
