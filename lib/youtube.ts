// Convierte un enlace de YouTube (watch, youtu.be, live, shorts, embed) en enlace embebible
export function youtubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v")!;
    else { const m = u.pathname.match(/\/(live|embed|shorts)\/([\w-]+)/); if (m) id = m[2]; }
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}

// Sala de videoconferencia gratuita (Jitsi) si el curso no tiene un enlace propio
export const liveRoom = (courseId: string, liveUrl?: string | null) => liveUrl || `https://meet.jit.si/MissionUJEBS-${courseId.slice(0, 8)}`;
