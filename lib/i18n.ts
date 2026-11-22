import { es, type Dict } from "@/dictionaries/es";
import { fr } from "@/dictionaries/fr";
import { ht } from "@/dictionaries/ht";
import { en } from "@/dictionaries/en";
import { pt } from "@/dictionaries/pt";
import { extra } from "@/dictionaries/extra";
import { locales, defaultLocale, type Locale } from "@/config/site";

const base: Record<Locale, Dict> = { es, fr, ht, en, pt };

// Combina el diccionario del idioma con las traducciones adicionales (aula virtual)
function merge(lang: Locale): Dict {
  const d = base[lang];
  const x = extra[lang];
  return {
    ...d,
    modules: {
      ...d.modules,
      ...x.modules,
      courses: { ...d.modules.courses, fields: { ...d.modules.courses.fields, ...x.courseFields } },
    },
  } as Dict;
}
const dictionaries = Object.fromEntries(locales.map((l) => [l, merge(l)])) as Record<Locale, Dict>;

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);
export const getDict = (lang: string): Dict => dictionaries[isLocale(lang) ? lang : defaultLocale];
export type { Dict };
