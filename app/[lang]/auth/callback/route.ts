import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recibe los enlaces de correo (confirmación de cuenta y recuperación de contraseña)
export async function GET(req: Request, { params }: { params: { lang: string } }) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const raw = url.searchParams.get("next") ?? "";
  // Solo rutas internas (evita redirecciones a otros sitios)
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : `/${params.lang}/panel`;
  if (code) {
    const { error } = await createClient().auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/${params.lang}/login?error=1`, url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
