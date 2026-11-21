import type { ModuleDef } from "@/lib/modules";
import type { Dict } from "@/lib/i18n";

export type RefOptions = Record<string, { id: string; label: string }[]>;

const inputType: Record<string, string> = { number: "number", date: "date", datetime: "datetime-local", url: "url", email: "email" };

function toInputValue(type: string, v: unknown) {
  if (v === null || v === undefined) return "";
  if (type === "datetime") {
    const d = new Date(String(v));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return String(v);
}

export function RecordForm({
  mod, t, refOptions, action, values = {}, writer, hideSite,
}: {
  mod: ModuleDef; t: Dict; refOptions: RefOptions; action: (fd: FormData) => void;
  values?: Record<string, unknown>; writer: boolean; hideSite: boolean;
}) {
  const mt = t.modules[mod.key as keyof typeof t.modules];
  const label = (k: string) => (mt.fields as Record<string, string>)[k] ?? k;
  const opt = (v: string) => t.options[v] ?? v;
  const fields = mod.fields.filter((f) => (writer || f.key !== "status") && !(hideSite && f.key === "site_id"));

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => {
        const v = toInputValue(f.type, values[f.key]);
        return (
          <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
            {f.type === "bool" ? (
              <label className="flex items-center gap-2 pt-5 text-sm">
                <input type="checkbox" name={f.key} defaultChecked={!!values[f.key]} className="h-4 w-4" /> {label(f.key)}
              </label>
            ) : (
              <>
                <label className="label">{label(f.key)}{f.required && " *"}</label>
                {f.type === "textarea" ? (
                  <textarea name={f.key} required={f.required} rows={3} defaultValue={v} className="input" />
                ) : f.type === "select" ? (
                  <select name={f.key} required={f.required} defaultValue={v} className="input">
                    <option value="">{t.common.select}</option>
                    {f.options!.map((o) => <option key={o} value={o}>{opt(o)}</option>)}
                  </select>
                ) : f.type === "ref" ? (
                  <select name={f.key} defaultValue={v} className="input">
                    <option value="">{f.key === "site_id" ? t.sites.allSites : t.common.select}</option>
                    {refOptions[f.key]?.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                ) : (
                  <input name={f.key} required={f.required} defaultValue={v} step={f.type === "number" ? "any" : undefined}
                    type={inputType[f.type] ?? "text"} maxLength={f.type === "text" ? 200 : undefined} className="input" />
                )}
              </>
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2"><button className="btn">{t.common.save}</button></div>
    </form>
  );
}
