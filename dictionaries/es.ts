export const es = {
  nav: { home: "Inicio", panel: "Panel", login: "Ingresar", logout: "Salir", users: "Usuarios y roles" },
  common: {
    save: "Guardar", delete: "Eliminar", add: "Agregar", yes: "Sí", no: "No", empty: "Aún no hay registros.",
    noAccess: "No tienes permiso para ver esta sección.", actions: "Acciones", select: "— Seleccionar —",
    language: "Idioma", total: "Total", back: "Volver", newRecord: "Nuevo registro", edit: "Editar", saved: "Guardado correctamente.", saveError: "No se pudo guardar. Revisa los datos o tus permisos.", all: "Todas", search: "Filtrar",
    records: "registros",
  },
  home: {
    welcome: "Bienvenidos a", subtitle: "Una familia que adora a Dios y sirve a su comunidad.",
    schedule: "Horarios de culto", upcomingEvents: "Próximos eventos", latestSermons: "Últimas prédicas",
    announcements: "Anuncios", prayerCta: "¿Necesitas oración? Ingresa y envía tu petición.",
    contact: "Contacto", joinUs: "Únete a la comunidad", watch: "Ver",
  },
  days: { sunday: "Domingo", monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado" },
  auth: {
    title: "Acceso de miembros", email: "Correo electrónico", password: "Contraseña", fullName: "Nombre completo",
    signIn: "Ingresar", signUp: "Crear cuenta", noAccount: "¿No tienes cuenta?", haveAccount: "¿Ya tienes cuenta?",
    checkEmail: "Cuenta creada. Revisa tu correo si se pide confirmación y luego ingresa.", error: "Correo o contraseña incorrectos.",
  },
  panel: { title: "Panel de la iglesia", hello: "Hola", role: "Tu rol", summary: "Resumen" },
  roles: { miembro: "Miembro", lider: "Líder", secretaria: "Secretaría", tesorero: "Tesorería", pastor: "Pastor", admin: "Administrador" },
  users: { title: "Usuarios y roles", changeRole: "Cambiar rol", site: "Sede", onlyAdmin: "Solo el administrador puede cambiar roles." },
  sites: { allSites: "Toda la iglesia", filter: "Sede:", directory: "Directorio de congregaciones", directoryDesc: "Encuentra una sede y consulta sus horarios de culto.", searchLabel: "Buscar por sede, país o ciudad", searchBtn: "Buscar", seeAll: "Ver todas", noResults: "No se encontraron sedes para esta búsqueda.", noSites: "Todavía no hay sedes publicadas.", general: "General (todas las sedes)", scheduleTbc: "Horario por confirmar" },
  modules: {
    sites: { title: "Sedes", desc: "Congregaciones en cada ciudad y país", fields: { name: "Nombre de la sede", country: "País", city: "Ciudad", address: "Dirección", schedule: "Horario de culto", pastor_name: "Pastor", phone: "Teléfono", published: "Publicada en el directorio" } },
    members: { title: "Miembros", desc: "Registro de la congregación", fields: { site_id: "Sede", full_name: "Nombre completo", email: "Correo", phone: "Teléfono", birth_date: "Fecha de nacimiento", address: "Dirección", country: "País", baptized: "Bautizado", status: "Estado", cell_id: "Célula", ministry_id: "Ministerio" } },
    cells: { title: "Células", desc: "Grupos en casas", fields: { site_id: "Sede", name: "Nombre", leader_name: "Líder", meeting_day: "Día de reunión", address: "Dirección" } },
    ministries: { title: "Ministerios", desc: "Alabanza, jóvenes, niños y más", fields: { site_id: "Sede", name: "Nombre", leader_name: "Líder", description: "Descripción" } },
    attendance: { title: "Asistencia", desc: "Conteo por culto o célula", fields: { site_id: "Sede", date: "Fecha", service: "Culto / reunión", cell_id: "Célula", adults: "Adultos", children: "Niños", visitors: "Visitas", notes: "Notas" } },
    events: { title: "Eventos", desc: "Calendario de actividades", fields: { site_id: "Sede", title: "Título", starts_at: "Fecha y hora", location: "Lugar", description: "Descripción", is_public: "Público" } },
    sermons: { title: "Prédicas", desc: "Mensajes en video y audio", fields: { site_id: "Sede", title: "Título", preacher: "Predicador", date: "Fecha", bible_passage: "Pasaje bíblico", video_url: "Video (YouTube)", audio_url: "Audio", summary: "Resumen" } },
    donations: { title: "Diezmos y ofrendas", desc: "Control de finanzas", fields: { site_id: "Sede", date: "Fecha", kind: "Tipo", amount: "Monto", currency: "Moneda", method: "Medio", member_id: "Miembro", notes: "Notas" } },
    announcements: { title: "Anuncios", desc: "Noticias de la iglesia", fields: { site_id: "Sede", title: "Título", body: "Mensaje", is_public: "Público" } },
    prayer_requests: { title: "Peticiones de oración", desc: "Oremos unos por otros", fields: { site_id: "Sede", name: "Nombre", request: "Petición", is_public: "Compartir con la iglesia", status: "Estado" } },
  },
  options: {
    active: "Activo", visitor: "Visitante", inactive: "Inactivo",
    tithe: "Diezmo", offering: "Ofrenda", missions: "Misiones", building: "Construcción", other: "Otro",
    cash: "Efectivo", transfer: "Transferencia", card: "Tarjeta",
    pending: "Pendiente", praying: "Orando", answered: "Respondida",
  } as Record<string, string>,
};
export type Dict = typeof es;
