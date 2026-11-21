// ⚙️ Cambia aquí los datos de la iglesia. Todo el sitio los usa.
export const site = {
  name: "Mission Iglesia Universal de Jesucristo El Buen Samaritano",
  shortName: "Mission UJEBS",
  verse: "Juan 3:16",
  address: "Dirección de la iglesia",
  phone: "+56 9 0000 0000",
  email: "contacto@iglesia.org",
  schedule: [
    { day: "sunday", time: "10:00" },
    { day: "wednesday", time: "19:30" },
    { day: "friday", time: "19:30" },
  ],
  social: {
    youtube: "",
    facebook: "",
    instagram: "",
  },
};

// Idiomas disponibles. Para agregar otro: crea dictionaries/<código>.ts y súmalo aquí y en lib/i18n.ts
export const locales = ["es", "fr", "ht", "en", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const localeNames: Record<Locale, string> = {
  es: "Español",
  fr: "Français",
  ht: "Kreyòl",
  en: "English",
  pt: "Português",
};

export const roles = ["miembro", "lider", "secretaria", "tesorero", "pastor", "admin"] as const;
export type Role = (typeof roles)[number];
