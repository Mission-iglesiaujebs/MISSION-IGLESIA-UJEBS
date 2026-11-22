import type { Role } from "@/config/site";

export type FieldType = "text" | "textarea" | "number" | "date" | "datetime" | "bool" | "select" | "url" | "email" | "ref";

export type Field = {
  key: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  ref?: { table: string; label: string };
  list?: boolean;
};

export type ModuleDef = {
  key: string;
  table: string;
  icon: string;
  group: GroupKey;
  order: { column: string; ascending: boolean };
  write: Role[];
  read?: Role[]; // roles que ven el módulo en el menú (por defecto: todos)
  anyMemberCanCreate?: boolean;
  noCreate?: boolean; // solo se edita (p. ej. entregas que hacen los alumnos)
  search: string; // campo de texto para buscar
  fields: Field[];
};

export const groups = ["congregation", "formation", "worship", "finance", "communication", "administration"] as const;
export type GroupKey = (typeof groups)[number];

const staff: Role[] = ["secretaria", "pastor", "admin"];
const leaders: Role[] = ["lider", ...staff];
const finance: Role[] = ["tesorero", "pastor", "admin"];
const S: Field = { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true };
const MEMBER: Field = { key: "member_id", type: "ref", ref: { table: "members", label: "full_name" }, list: true };
const CURRENCY: Field = { key: "currency", type: "select", options: ["CLP", "USD", "EUR", "HTG", "BRL"], required: true, list: true };

export const modules: ModuleDef[] = [
  // ---------- Congregación ----------
  {
    key: "members", table: "members", icon: "👥", group: "congregation", search: "full_name",
    order: { column: "full_name", ascending: true }, write: leaders, read: [...leaders, "tesorero"],
    fields: [
      S,
      { key: "full_name", type: "text", required: true, list: true },
      { key: "email", type: "email", list: true },
      { key: "phone", type: "text", list: true },
      { key: "birth_date", type: "date" },
      { key: "address", type: "text" },
      { key: "country", type: "text", list: true },
      { key: "baptized", type: "bool", list: true },
      { key: "status", type: "select", options: ["active", "visitor", "inactive"], list: true },
      { key: "cell_id", type: "ref", ref: { table: "cells", label: "name" }, list: true },
      { key: "ministry_id", type: "ref", ref: { table: "ministries", label: "name" } },
    ],
  },
  {
    key: "visitors", table: "visitors", icon: "🤝", group: "congregation", search: "full_name",
    order: { column: "visit_date", ascending: false }, write: leaders, read: leaders,
    fields: [
      S,
      { key: "full_name", type: "text", required: true, list: true },
      { key: "phone", type: "text", list: true },
      { key: "email", type: "email" },
      { key: "visit_date", type: "date", required: true, list: true },
      { key: "invited_by", type: "text", list: true },
      { key: "status", type: "select", options: ["new", "contacted", "returning", "member"], list: true },
      { key: "notes", type: "textarea" },
    ],
  },
  {
    key: "cells", table: "cells", icon: "🏠", group: "congregation", search: "name",
    order: { column: "name", ascending: true }, write: leaders,
    fields: [
      S,
      { key: "name", type: "text", required: true, list: true },
      { key: "leader_name", type: "text", list: true },
      { key: "meeting_day", type: "text", list: true },
      { key: "address", type: "text", list: true },
    ],
  },
  {
    key: "ministries", table: "ministries", icon: "🎵", group: "congregation", search: "name",
    order: { column: "name", ascending: true }, write: staff,
    fields: [
      S,
      { key: "name", type: "text", required: true, list: true },
      { key: "leader_name", type: "text", list: true },
      { key: "description", type: "textarea", list: true },
    ],
  },
  {
    key: "attendance", table: "attendance", icon: "📋", group: "congregation", search: "service",
    order: { column: "date", ascending: false }, write: leaders, read: leaders,
    fields: [
      S,
      { key: "date", type: "date", required: true, list: true },
      { key: "service", type: "text", required: true, list: true },
      { key: "cell_id", type: "ref", ref: { table: "cells", label: "name" }, list: true },
      { key: "adults", type: "number", list: true },
      { key: "children", type: "number", list: true },
      { key: "visitors", type: "number", list: true },
      { key: "notes", type: "textarea" },
    ],
  },
  // ---------- Formación ----------
  {
    key: "courses", table: "courses", icon: "🎓", group: "formation", search: "title",
    order: { column: "starts_on", ascending: false }, write: leaders,
    fields: [
      S,
      { key: "title", type: "text", required: true, list: true },
      { key: "teacher", type: "text", list: true },
      { key: "schedule", type: "text", list: true },
      { key: "starts_on", type: "date", list: true },
      { key: "is_open", type: "bool", list: true },
      { key: "capacity", type: "number", list: true },
      { key: "level", type: "text" },
      { key: "live_url", type: "url" },
      { key: "description", type: "textarea" },
    ],
  },
  {
    key: "lessons", table: "lessons", icon: "📚", group: "formation", search: "title",
    order: { column: "position", ascending: true }, write: leaders, read: leaders,
    fields: [
      S,
      { key: "course_id", type: "ref", ref: { table: "courses", label: "title" }, required: true, list: true },
      { key: "position", type: "number", list: true },
      { key: "title", type: "text", required: true, list: true },
      { key: "video_url", type: "url", list: true },
      { key: "material_url", type: "url" },
      { key: "content", type: "textarea" },
    ],
  },
  {
    key: "assignments", table: "assignments", icon: "🗒", group: "formation", search: "title",
    order: { column: "created_at", ascending: false }, write: leaders, read: leaders,
    fields: [
      S,
      { key: "course_id", type: "ref", ref: { table: "courses", label: "title" }, required: true, list: true },
      { key: "title", type: "text", required: true, list: true },
      { key: "due_at", type: "datetime", list: true },
      { key: "points", type: "number", list: true },
      { key: "instructions", type: "textarea" },
    ],
  },
  {
    key: "quiz_questions", table: "quiz_questions", icon: "❓", group: "formation", search: "question",
    order: { column: "position", ascending: true }, write: leaders, read: leaders,
    fields: [
      S,
      { key: "course_id", type: "ref", ref: { table: "courses", label: "title" }, required: true, list: true },
      { key: "position", type: "number", list: true },
      { key: "question", type: "text", required: true, list: true },
      { key: "option_a", type: "text", required: true },
      { key: "option_b", type: "text", required: true },
      { key: "option_c", type: "text" },
      { key: "option_d", type: "text" },
      { key: "correct", type: "select", options: ["a", "b", "c", "d"], required: true, list: true },
    ],
  },
  {
    key: "submissions", table: "submissions", icon: "✅", group: "formation", search: "student_name",
    order: { column: "created_at", ascending: false }, write: leaders, read: leaders, noCreate: true,
    fields: [
      { key: "assignment_id", type: "ref", ref: { table: "assignments", label: "title" }, required: true, list: true },
      { key: "student_name", type: "text", list: true },
      { key: "content", type: "textarea", list: true },
      { key: "link", type: "url", list: true },
      { key: "grade", type: "number", list: true },
      { key: "feedback", type: "textarea" },
    ],
  },
  {
    key: "enrollments", table: "enrollments", icon: "📝", group: "formation", search: "grade",
    order: { column: "created_at", ascending: false }, write: leaders, read: leaders,
    fields: [
      S,
      { key: "course_id", type: "ref", ref: { table: "courses", label: "title" }, required: true, list: true },
      { ...MEMBER, required: true },
      { key: "status", type: "select", options: ["enrolled", "completed", "dropped"], list: true },
      { key: "grade", type: "text", list: true },
    ],
  },
  // ---------- Culto y medios ----------
  {
    key: "events", table: "events", icon: "📅", group: "worship", search: "title",
    order: { column: "starts_at", ascending: true }, write: staff,
    fields: [
      S,
      { key: "title", type: "text", required: true, list: true },
      { key: "starts_at", type: "datetime", required: true, list: true },
      { key: "location", type: "text", list: true },
      { key: "description", type: "textarea" },
      { key: "is_public", type: "bool", list: true },
    ],
  },
  {
    key: "sermons", table: "sermons", icon: "📖", group: "worship", search: "title",
    order: { column: "date", ascending: false }, write: staff,
    fields: [
      S,
      { key: "title", type: "text", required: true, list: true },
      { key: "preacher", type: "text", list: true },
      { key: "date", type: "date", list: true },
      { key: "bible_passage", type: "text", list: true },
      { key: "video_url", type: "url", list: true },
      { key: "audio_url", type: "url" },
      { key: "summary", type: "textarea" },
    ],
  },
  {
    key: "livestreams", table: "livestreams", icon: "🔴", group: "worship", search: "title",
    order: { column: "starts_at", ascending: false }, write: staff,
    fields: [
      S,
      { key: "title", type: "text", required: true, list: true },
      { key: "youtube_url", type: "url", required: true, list: true },
      { key: "starts_at", type: "datetime", required: true, list: true },
      { key: "is_live", type: "bool", list: true },
    ],
  },
  {
    key: "service_roster", table: "service_roster", icon: "🙋", group: "worship", search: "task",
    order: { column: "date", ascending: true }, write: leaders,
    fields: [
      S,
      { key: "date", type: "date", required: true, list: true },
      { key: "task", type: "text", required: true, list: true },
      { key: "ministry_id", type: "ref", ref: { table: "ministries", label: "name" }, list: true },
      MEMBER,
      { key: "notes", type: "textarea" },
    ],
  },
  // ---------- Finanzas ----------
  {
    key: "donations", table: "donations", icon: "💝", group: "finance", search: "notes",
    order: { column: "date", ascending: false }, write: finance, read: finance,
    fields: [
      S,
      { key: "date", type: "date", required: true, list: true },
      { key: "kind", type: "select", options: ["tithe", "offering", "missions", "building", "other"], required: true, list: true },
      { key: "amount", type: "number", required: true, list: true },
      CURRENCY,
      { key: "method", type: "select", options: ["cash", "transfer", "card"], list: true },
      MEMBER,
      { key: "notes", type: "textarea" },
    ],
  },
  {
    key: "expenses", table: "expenses", icon: "🧾", group: "finance", search: "description",
    order: { column: "date", ascending: false }, write: finance, read: finance,
    fields: [
      S,
      { key: "date", type: "date", required: true, list: true },
      { key: "category", type: "select", options: ["rent", "utilities", "salaries", "missions", "events", "maintenance", "supplies", "other"], required: true, list: true },
      { key: "amount", type: "number", required: true, list: true },
      CURRENCY,
      { key: "description", type: "textarea", list: true },
    ],
  },
  // ---------- Comunicación ----------
  {
    key: "announcements", table: "announcements", icon: "📢", group: "communication", search: "title",
    order: { column: "created_at", ascending: false }, write: staff,
    fields: [
      S,
      { key: "title", type: "text", required: true, list: true },
      { key: "body", type: "textarea", required: true, list: true },
      { key: "is_public", type: "bool", list: true },
    ],
  },
  {
    key: "prayer_requests", table: "prayer_requests", icon: "🙏", group: "communication", search: "request",
    order: { column: "created_at", ascending: false }, write: leaders, anyMemberCanCreate: true,
    fields: [
      S,
      { key: "name", type: "text", list: true },
      { key: "request", type: "textarea", required: true, list: true },
      { key: "is_public", type: "bool", list: true },
      { key: "status", type: "select", options: ["pending", "praying", "answered"], list: true },
    ],
  },
  // ---------- Administración ----------
  {
    key: "regions", table: "regions", icon: "🌎", group: "administration", search: "name",
    order: { column: "name", ascending: true }, write: ["pastor", "admin"],
    fields: [
      { key: "name", type: "text", required: true, list: true },
      { key: "description", type: "textarea", list: true },
    ],
  },
  {
    key: "sites", table: "sites", icon: "⛪", group: "administration", search: "name",
    order: { column: "country", ascending: true }, write: staff,
    fields: [
      { key: "name", type: "text", required: true, list: true },
      { key: "region_id", type: "ref", ref: { table: "regions", label: "name" }, list: true },
      { key: "country", type: "text", required: true, list: true },
      { key: "city", type: "text", required: true, list: true },
      { key: "address", type: "text" },
      { key: "schedule", type: "text", list: true },
      { key: "pastor_name", type: "text", list: true },
      { key: "phone", type: "text" },
      { key: "published", type: "bool", list: true },
    ],
  },
  {
    key: "inventory", table: "inventory", icon: "📦", group: "administration", search: "item",
    order: { column: "item", ascending: true }, write: staff, read: [...staff, "tesorero"],
    fields: [
      S,
      { key: "item", type: "text", required: true, list: true },
      { key: "category", type: "text", list: true },
      { key: "quantity", type: "number", list: true },
      { key: "location", type: "text", list: true },
      { key: "condition", type: "select", options: ["good", "fair", "poor"], list: true },
      { key: "notes", type: "textarea" },
    ],
  },
];

export const getModule = (key: string) => modules.find((m) => m.key === key);

export const canWrite = (m: ModuleDef, role: Role | null) => !!role && m.write.includes(role);
export const canCreate = (m: ModuleDef, role: Role | null) => !!role && !m.noCreate && (m.anyMemberCanCreate || canWrite(m, role));
export const canSee = (m: ModuleDef, role: Role | null) => !!role && (!m.read || m.read.includes(role));
