import type { Role } from "@/config/site";

export type FieldType = "text" | "textarea" | "number" | "date" | "datetime" | "bool" | "select" | "url" | "email" | "ref";

export type Field = {
  key: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // para select (las etiquetas se traducen en dictionaries.options)
  ref?: { table: string; label: string }; // para ref
  list?: boolean; // mostrar en la tabla
};

export type ModuleDef = {
  key: string;
  table: string;
  icon: string;
  order: { column: string; ascending: boolean };
  write: Role[]; // roles que pueden crear/borrar
  anyMemberCanCreate?: boolean;
  fields: Field[];
};

const staff: Role[] = ["secretaria", "pastor", "admin"];

export const modules: ModuleDef[] = [
  {
    key: "sites",
    table: "sites",
    icon: "⛪",
    order: { column: "country", ascending: true },
    write: staff,
    fields: [
      { key: "name", type: "text", required: true, list: true },
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
    key: "members",
    table: "members",
    icon: "👥",
    order: { column: "full_name", ascending: true },
    write: ["lider", ...staff],
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
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
    key: "cells",
    table: "cells",
    icon: "🏠",
    order: { column: "name", ascending: true },
    write: ["lider", ...staff],
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "name", type: "text", required: true, list: true },
      { key: "leader_name", type: "text", list: true },
      { key: "meeting_day", type: "text", list: true },
      { key: "address", type: "text", list: true },
    ],
  },
  {
    key: "ministries",
    table: "ministries",
    icon: "🎵",
    order: { column: "name", ascending: true },
    write: staff,
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "name", type: "text", required: true, list: true },
      { key: "leader_name", type: "text", list: true },
      { key: "description", type: "textarea", list: true },
    ],
  },
  {
    key: "attendance",
    table: "attendance",
    icon: "📋",
    order: { column: "date", ascending: false },
    write: ["lider", ...staff],
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "date", type: "date", required: true, list: true },
      { key: "service", type: "text", required: true, list: true },
      { key: "cell_id", type: "ref", ref: { table: "cells", label: "name" }, list: true },
      { key: "adults", type: "number", list: true },
      { key: "children", type: "number", list: true },
      { key: "visitors", type: "number", list: true },
      { key: "notes", type: "textarea" },
    ],
  },
  {
    key: "events",
    table: "events",
    icon: "📅",
    order: { column: "starts_at", ascending: true },
    write: staff,
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "title", type: "text", required: true, list: true },
      { key: "starts_at", type: "datetime", required: true, list: true },
      { key: "location", type: "text", list: true },
      { key: "description", type: "textarea" },
      { key: "is_public", type: "bool", list: true },
    ],
  },
  {
    key: "sermons",
    table: "sermons",
    icon: "📖",
    order: { column: "date", ascending: false },
    write: staff,
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
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
    key: "donations",
    table: "donations",
    icon: "💝",
    order: { column: "date", ascending: false },
    write: ["tesorero", "pastor", "admin"],
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "date", type: "date", required: true, list: true },
      { key: "kind", type: "select", options: ["tithe", "offering", "missions", "building", "other"], required: true, list: true },
      { key: "amount", type: "number", required: true, list: true },
      { key: "currency", type: "select", options: ["CLP", "USD", "EUR", "HTG", "BRL"], required: true, list: true },
      { key: "method", type: "select", options: ["cash", "transfer", "card"], list: true },
      { key: "member_id", type: "ref", ref: { table: "members", label: "full_name" }, list: true },
      { key: "notes", type: "textarea" },
    ],
  },
  {
    key: "announcements",
    table: "announcements",
    icon: "📢",
    order: { column: "created_at", ascending: false },
    write: staff,
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "title", type: "text", required: true, list: true },
      { key: "body", type: "textarea", required: true, list: true },
      { key: "is_public", type: "bool", list: true },
    ],
  },
  {
    key: "prayer_requests",
    table: "prayer_requests",
    icon: "🙏",
    order: { column: "created_at", ascending: false },
    write: ["lider", ...staff],
    anyMemberCanCreate: true,
    fields: [
      { key: "site_id", type: "ref", ref: { table: "sites", label: "name" }, list: true },
      { key: "name", type: "text", list: true },
      { key: "request", type: "textarea", required: true, list: true },
      { key: "is_public", type: "bool", list: true },
      { key: "status", type: "select", options: ["pending", "praying", "answered"], list: true },
    ],
  },
];

export const getModule = (key: string) => modules.find((m) => m.key === key);

export const canWrite = (m: ModuleDef, role: Role | null) => !!role && m.write.includes(role);
export const canCreate = (m: ModuleDef, role: Role | null) => !!role && (m.anyMemberCanCreate || canWrite(m, role));
