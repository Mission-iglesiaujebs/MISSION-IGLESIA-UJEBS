import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Role } from "@/config/site";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: { name: string; value: string; options?: CookieOptions }[]) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // llamado desde un Server Component: el middleware refresca la sesión
          }
        },
      },
    }
  );
}

export type Profile = {
  id: string; full_name: string | null; role: Role; site_id: string | null; region_id: string | null;
  custom_role_id: string | null; avatar_path: string | null; phone: string | null;
  sites: { name: string } | null; regions: { name: string } | null; custom_roles: { name: string } | null;
};

// Cuenta general = sin iglesia y sin región (administra toda la misión)
export const isGlobal = (p: Profile | null) => !!p && !p.site_id && !p.region_id;

async function load() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as null | Profile };
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, site_id, region_id, custom_role_id, avatar_path, phone, sites(name), regions(name), custom_roles(name)")
    .eq("id", user.id)
    .single();
  if (!profile) {
    // base de datos aún sin la Fase 5: columnas mínimas
    const r = await supabase.from("profiles").select("id, full_name, role, site_id, sites(name)").eq("id", user.id).single();
    profile = r.data ? { ...r.data, region_id: null, custom_role_id: null, avatar_path: null, phone: null, regions: null, custom_roles: null } as never : null;
  }
  return { supabase, user, profile: (profile as unknown as Profile | null) ?? null };
}

// Una sola consulta de sesión y perfil por petición
export const getSessionProfile = cache(load);
