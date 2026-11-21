import type { Dict } from "./es";
export const fr: Dict = {
  nav: { home: "Accueil", panel: "Tableau de bord", login: "Connexion", logout: "Déconnexion", users: "Utilisateurs et rôles" },
  common: {
    save: "Enregistrer", delete: "Supprimer", add: "Ajouter", yes: "Oui", no: "Non", empty: "Aucun enregistrement pour le moment.",
    noAccess: "Vous n'avez pas accès à cette section.", actions: "Actions", select: "— Choisir —",
    language: "Langue", total: "Total", back: "Retour", newRecord: "Nouvel enregistrement", edit: "Modifier", saved: "Enregistré avec succès.", saveError: "Impossible d'enregistrer. Vérifiez les données ou vos droits.", all: "Toutes", search: "Filtrer",
    records: "enregistrements",
  },
  home: {
    welcome: "Bienvenue à", subtitle: "Une famille qui adore Dieu et sert sa communauté.",
    schedule: "Horaires des cultes", upcomingEvents: "Événements à venir", latestSermons: "Dernières prédications",
    announcements: "Annonces", prayerCta: "Besoin de prière ? Connectez-vous et envoyez votre demande.",
    contact: "Contact", joinUs: "Rejoignez la communauté", watch: "Voir",
  },
  days: { sunday: "Dimanche", monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi", thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi" },
  auth: {
    title: "Espace membres", email: "Courriel", password: "Mot de passe", fullName: "Nom complet",
    signIn: "Se connecter", signUp: "Créer un compte", noAccount: "Pas de compte ?", haveAccount: "Déjà un compte ?",
    checkEmail: "Compte créé. Vérifiez votre courriel si une confirmation est demandée, puis connectez-vous.", error: "Courriel ou mot de passe incorrect.",
  },
  panel: { title: "Tableau de bord de l'église", hello: "Bonjour", role: "Votre rôle", summary: "Résumé" },
  roles: { miembro: "Membre", lider: "Leader", secretaria: "Secrétariat", tesorero: "Trésorerie", pastor: "Pasteur", admin: "Administrateur" },
  users: { title: "Utilisateurs et rôles", changeRole: "Changer le rôle", site: "Assemblée", onlyAdmin: "Seul l'administrateur peut changer les rôles." },
  sites: { allSites: "Toute l'église", filter: "Assemblée :", directory: "Annuaire des assemblées", directoryDesc: "Trouvez une assemblée et consultez ses horaires de culte.", searchLabel: "Rechercher par assemblée, pays ou ville", searchBtn: "Rechercher", seeAll: "Tout voir", noResults: "Aucune assemblée trouvée pour cette recherche.", noSites: "Aucune assemblée publiée pour le moment.", general: "Générale (toutes les assemblées)", scheduleTbc: "Horaire à confirmer" },
  modules: {
    sites: { title: "Assemblées", desc: "Congrégations dans chaque ville et pays", fields: { name: "Nom de l'assemblée", country: "Pays", city: "Ville", address: "Adresse", schedule: "Horaire du culte", pastor_name: "Pasteur", phone: "Téléphone", published: "Publiée dans l'annuaire" } },
    members: { title: "Membres", desc: "Registre de l'assemblée", fields: { site_id: "Assemblée", full_name: "Nom complet", email: "Courriel", phone: "Téléphone", birth_date: "Date de naissance", address: "Adresse", country: "Pays", baptized: "Baptisé", status: "Statut", cell_id: "Cellule", ministry_id: "Ministère" } },
    cells: { title: "Cellules", desc: "Groupes de maison", fields: { site_id: "Assemblée", name: "Nom", leader_name: "Responsable", meeting_day: "Jour de réunion", address: "Adresse" } },
    ministries: { title: "Ministères", desc: "Louange, jeunesse, enfants et plus", fields: { site_id: "Assemblée", name: "Nom", leader_name: "Responsable", description: "Description" } },
    attendance: { title: "Présence", desc: "Comptage par culte ou cellule", fields: { site_id: "Assemblée", date: "Date", service: "Culte / réunion", cell_id: "Cellule", adults: "Adultes", children: "Enfants", visitors: "Visiteurs", notes: "Notes" } },
    events: { title: "Événements", desc: "Calendrier des activités", fields: { site_id: "Assemblée", title: "Titre", starts_at: "Date et heure", location: "Lieu", description: "Description", is_public: "Public" } },
    sermons: { title: "Prédications", desc: "Messages en vidéo et audio", fields: { site_id: "Assemblée", title: "Titre", preacher: "Prédicateur", date: "Date", bible_passage: "Passage biblique", video_url: "Vidéo (YouTube)", audio_url: "Audio", summary: "Résumé" } },
    donations: { title: "Dîmes et offrandes", desc: "Gestion des finances", fields: { site_id: "Assemblée", date: "Date", kind: "Type", amount: "Montant", currency: "Devise", method: "Moyen", member_id: "Membre", notes: "Notes" } },
    announcements: { title: "Annonces", desc: "Nouvelles de l'église", fields: { site_id: "Assemblée", title: "Titre", body: "Message", is_public: "Public" } },
    prayer_requests: { title: "Demandes de prière", desc: "Prions les uns pour les autres", fields: { site_id: "Assemblée", name: "Nom", request: "Demande", is_public: "Partager avec l'église", status: "Statut" } },
  },
  options: {
    active: "Actif", visitor: "Visiteur", inactive: "Inactif",
    tithe: "Dîme", offering: "Offrande", missions: "Missions", building: "Construction", other: "Autre",
    cash: "Espèces", transfer: "Virement", card: "Carte",
    pending: "En attente", praying: "En prière", answered: "Exaucée",
  },
};
