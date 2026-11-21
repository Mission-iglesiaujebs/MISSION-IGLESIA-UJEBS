import type { Dict } from "./es";
export const en: Dict = {
  nav: { home: "Home", panel: "Dashboard", login: "Sign in", logout: "Sign out", users: "Users & roles" },
  common: {
    save: "Save", delete: "Delete", add: "Add", yes: "Yes", no: "No", empty: "No records yet.",
    noAccess: "You don't have access to this section.", actions: "Actions", select: "— Select —",
    language: "Language", total: "Total", back: "Back", newRecord: "New record", edit: "Edit", saved: "Saved successfully.", saveError: "Could not save. Check the data or your permissions.", all: "All", search: "Filter",
    records: "records",
  },
  home: {
    welcome: "Welcome to", subtitle: "A family that worships God and serves its community.",
    schedule: "Service times", upcomingEvents: "Upcoming events", latestSermons: "Latest sermons",
    announcements: "Announcements", prayerCta: "Need prayer? Sign in and send your request.",
    contact: "Contact", joinUs: "Join the community", watch: "Watch",
  },
  days: { sunday: "Sunday", monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday" },
  auth: {
    title: "Members area", email: "Email", password: "Password", fullName: "Full name",
    signIn: "Sign in", signUp: "Create account", noAccount: "No account?", haveAccount: "Already have an account?",
    checkEmail: "Account created. Check your email if confirmation is required, then sign in.", error: "Wrong email or password.",
  },
  panel: { title: "Church dashboard", hello: "Hello", role: "Your role", summary: "Summary" },
  roles: { miembro: "Member", lider: "Leader", secretaria: "Secretary", tesorero: "Treasurer", pastor: "Pastor", admin: "Administrator" },
  users: { title: "Users & roles", changeRole: "Change role", site: "Branch", onlyAdmin: "Only the administrator can change roles." },
  sites: { allSites: "Whole church", filter: "Branch:", directory: "Congregation directory", directoryDesc: "Find a branch and check its service times.", searchLabel: "Search by branch, country or city", searchBtn: "Search", seeAll: "See all", noResults: "No branches found for this search.", noSites: "No branches published yet.", general: "General (all branches)", scheduleTbc: "Schedule to be confirmed" },
  modules: {
    sites: { title: "Branches", desc: "Congregations in each city and country", fields: { name: "Branch name", country: "Country", city: "City", address: "Address", schedule: "Service times", pastor_name: "Pastor", phone: "Phone", published: "Listed in directory" } },
    members: { title: "Members", desc: "Congregation registry", fields: { site_id: "Branch", full_name: "Full name", email: "Email", phone: "Phone", birth_date: "Birth date", address: "Address", country: "Country", baptized: "Baptized", status: "Status", cell_id: "Cell group", ministry_id: "Ministry" } },
    cells: { title: "Cell groups", desc: "Home groups", fields: { site_id: "Branch", name: "Name", leader_name: "Leader", meeting_day: "Meeting day", address: "Address" } },
    ministries: { title: "Ministries", desc: "Worship, youth, kids and more", fields: { site_id: "Branch", name: "Name", leader_name: "Leader", description: "Description" } },
    attendance: { title: "Attendance", desc: "Headcount per service or cell", fields: { site_id: "Branch", date: "Date", service: "Service / meeting", cell_id: "Cell group", adults: "Adults", children: "Children", visitors: "Visitors", notes: "Notes" } },
    events: { title: "Events", desc: "Activity calendar", fields: { site_id: "Branch", title: "Title", starts_at: "Date & time", location: "Location", description: "Description", is_public: "Public" } },
    sermons: { title: "Sermons", desc: "Video and audio messages", fields: { site_id: "Branch", title: "Title", preacher: "Preacher", date: "Date", bible_passage: "Bible passage", video_url: "Video (YouTube)", audio_url: "Audio", summary: "Summary" } },
    donations: { title: "Tithes & offerings", desc: "Finance tracking", fields: { site_id: "Branch", date: "Date", kind: "Type", amount: "Amount", currency: "Currency", method: "Method", member_id: "Member", notes: "Notes" } },
    announcements: { title: "Announcements", desc: "Church news", fields: { site_id: "Branch", title: "Title", body: "Message", is_public: "Public" } },
    prayer_requests: { title: "Prayer requests", desc: "Pray for one another", fields: { site_id: "Branch", name: "Name", request: "Request", is_public: "Share with the church", status: "Status" } },
  },
  options: {
    active: "Active", visitor: "Visitor", inactive: "Inactive",
    tithe: "Tithe", offering: "Offering", missions: "Missions", building: "Building fund", other: "Other",
    cash: "Cash", transfer: "Bank transfer", card: "Card",
    pending: "Pending", praying: "Praying", answered: "Answered",
  },
};
