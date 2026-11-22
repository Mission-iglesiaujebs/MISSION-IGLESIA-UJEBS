import type { SysModule } from "@/lib/catalog";
import { fLabel, optionLabel } from "@/lib/catalog";

const inputType: Record<string, string> = { number: "number", date: "date", datetime: "datetime-local", url: "url", email: "email" };

function toInput(type: string, v: unknown) {
  if (v === null || v === undefined) return "";
  if (type === "datetime") {
    const d = new Date(String(v));
    if (isNaN(d.getTime())) return "";
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  return String(v);
}

export function SysForm({
  sys, lang, action, values = {}, sites, siteValue, labels,
}: {
  sys: SysModule; lang: string; action: (fd: FormData) => void; values?: Record<string, unknown>;
  sites: { id: string; name: string }[] | null; siteValue?: string | null;
  labels: { save: string; select: string; site: string; allSites: string };
}) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {sites && (
        <div>
          <label className="label">{labels.site}</label>
          <select name="site_id" defaultValue={siteValue ?? ""} className="input">
            <option value="">{labels.allSites}</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      {sys.fields.map((f) => {
        const v = toInput(f.type, values[f.key]);
        const label = fLabel(f, lang);
        return (
          <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
            {f.type === "bool" ? (
              <label className="flex items-center gap-2 pt-5 text-sm">
                <input type="checkbox" name={f.key} defaultChecked={!!values[f.key]} className="h-4 w-4" /> {label}
              </label>
            ) : (
              <>
                <label className="label">{label}</label>
                {f.type === "textarea" ? (
                  <textarea name={f.key} rows={3} defaultValue={v} maxLength={5000} className="input" />
                ) : f.type === "select" ? (
                  <select name={f.key} defaultValue={v} className="input">
                    <option value="">{labels.select}</option>
                    {f.options!.map((o) => <option key={o} value={o}>{optionLabel(o, lang)}</option>)}
                  </select>
                ) : (
                  <input name={f.key} defaultValue={v} type={inputType[f.type] ?? "text"} step={f.type === "number" ? "any" : undefined} maxLength={f.type === "text" ? 300 : undefined} className="input" />
                )}
              </>
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2"><button className="btn">{labels.save}</button></div>
    </form>
  );
}
