import type { Dict } from "./es";
export const ht: Dict = {
  nav: { home: "Akèy", panel: "Tablo", login: "Konekte", logout: "Dekonekte", users: "Itilizatè ak wòl" },
  common: {
    save: "Anrejistre", delete: "Efase", add: "Ajoute", yes: "Wi", no: "Non", empty: "Poko gen anyen.",
    noAccess: "Ou pa gen dwa wè seksyon sa a.", actions: "Aksyon", select: "— Chwazi —",
    language: "Lang", total: "Total", back: "Retounen", newRecord: "Nouvo anrejistreman", edit: "Modifye", saved: "Anrejistre avèk siksè.", saveError: "Pa t kapab anrejistre. Verifye done yo oswa dwa ou.", all: "Tout", search: "Filtre",
    records: "anrejistreman",
  },
  home: {
    welcome: "Byenvini nan", subtitle: "Yon fanmi k ap adore Bondye epi sèvi kominote li.",
    schedule: "Lè kilt yo", upcomingEvents: "Pwochen aktivite", latestSermons: "Dènye predikasyon",
    announcements: "Anons", prayerCta: "Ou bezwen lapriyè? Konekte epi voye demann ou.",
    contact: "Kontak", joinUs: "Vin jwenn kominote a", watch: "Gade",
  },
  days: { sunday: "Dimanch", monday: "Lendi", tuesday: "Madi", wednesday: "Mèkredi", thursday: "Jedi", friday: "Vandredi", saturday: "Samdi" },
  auth: {
    title: "Espas manm yo", email: "Imèl", password: "Modpas", fullName: "Non konplè",
    signIn: "Konekte", signUp: "Kreye kont", noAccount: "Ou pa gen kont?", haveAccount: "Ou gen kont deja?",
    checkEmail: "Kont lan kreye. Gade imèl ou si yo mande konfimasyon, epi konekte.", error: "Imèl oswa modpas pa bon.",
  },
  panel: { title: "Tablo legliz la", hello: "Bonjou", role: "Wòl ou", summary: "Rezime" },
  roles: { miembro: "Manm", lider: "Lidè", secretaria: "Sekretarya", tesorero: "Trezorye", pastor: "Pastè", admin: "Administratè" },
  users: { title: "Itilizatè ak wòl", changeRole: "Chanje wòl", site: "Legliz lokal", onlyAdmin: "Se administratè a sèlman ki ka chanje wòl." },
  sites: { allSites: "Tout legliz la", filter: "Legliz lokal:", directory: "Anyè kongregasyon yo", directoryDesc: "Jwenn yon legliz lokal epi gade lè kilt li yo.", searchLabel: "Chèche pa legliz, peyi oswa vil", searchBtn: "Chèche", seeAll: "Wè tout", noResults: "Pa jwenn okenn legliz pou rechèch sa a.", noSites: "Poko gen legliz lokal pibliye.", general: "Jeneral (tout legliz lokal yo)", scheduleTbc: "Lè a poko konfime" },
  modules: {
    sites: { title: "Legliz lokal", desc: "Kongregasyon nan chak vil ak peyi", fields: { name: "Non legliz la", country: "Peyi", city: "Vil", address: "Adrès", schedule: "Lè kilt", pastor_name: "Pastè", phone: "Telefòn", published: "Pibliye nan anyè a" } },
    members: { title: "Manm", desc: "Rejis kongregasyon an", fields: { site_id: "Legliz lokal", full_name: "Non konplè", email: "Imèl", phone: "Telefòn", birth_date: "Dat nesans", address: "Adrès", country: "Peyi", baptized: "Batize", status: "Estati", cell_id: "Selil", ministry_id: "Ministè" } },
    cells: { title: "Selil", desc: "Gwoup lakay", fields: { site_id: "Legliz lokal", name: "Non", leader_name: "Lidè", meeting_day: "Jou reyinyon", address: "Adrès" } },
    ministries: { title: "Ministè", desc: "Louwanj, jèn, timoun ak plis", fields: { site_id: "Legliz lokal", name: "Non", leader_name: "Lidè", description: "Deskripsyon" } },
    attendance: { title: "Prezans", desc: "Konte pa kilt oswa selil", fields: { site_id: "Legliz lokal", date: "Dat", service: "Kilt / reyinyon", cell_id: "Selil", adults: "Granmoun", children: "Timoun", visitors: "Vizitè", notes: "Nòt" } },
    events: { title: "Aktivite", desc: "Kalandriye aktivite yo", fields: { site_id: "Legliz lokal", title: "Tit", starts_at: "Dat ak lè", location: "Kote", description: "Deskripsyon", is_public: "Piblik" } },
    sermons: { title: "Predikasyon", desc: "Mesaj an videyo ak odyo", fields: { site_id: "Legliz lokal", title: "Tit", preacher: "Predikatè", date: "Dat", bible_passage: "Pasaj biblik", video_url: "Videyo (YouTube)", audio_url: "Odyo", summary: "Rezime" } },
    donations: { title: "Ladim ak ofrann", desc: "Jesyon finans", fields: { site_id: "Legliz lokal", date: "Dat", kind: "Kalite", amount: "Montan", currency: "Lajan", method: "Mwayen", member_id: "Manm", notes: "Nòt" } },
    announcements: { title: "Anons", desc: "Nouvèl legliz la", fields: { site_id: "Legliz lokal", title: "Tit", body: "Mesaj", is_public: "Piblik" } },
    prayer_requests: { title: "Demann lapriyè", desc: "Ann priye youn pou lòt", fields: { site_id: "Legliz lokal", name: "Non", request: "Demann", is_public: "Pataje ak legliz la", status: "Estati" } },
  },
  options: {
    active: "Aktif", visitor: "Vizitè", inactive: "Inaktif",
    tithe: "Ladim", offering: "Ofrann", missions: "Misyon", building: "Konstriksyon", other: "Lòt",
    cash: "Kach", transfer: "Transfè", card: "Kat",
    pending: "Ap tann", praying: "N ap priye", answered: "Egzose",
  },
};
