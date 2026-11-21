import { es, type Dict } from "@/dictionaries/es";
import { fr } from "@/dictionaries/fr";
import { ht } from "@/dictionaries/ht";
import { en } from "@/dictionaries/en";
import { pt } from "@/dictionaries/pt";
import { locales, defaultLocale, type Locale } from "@/config/site";

const dictionaries: Record<Locale, Dict> = { es, fr, ht, en, pt };

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);
export const getDict = (lang: string): Dict => dictionaries[isLocale(lang) ? lang : defaultLocale];
export type { Dict };
