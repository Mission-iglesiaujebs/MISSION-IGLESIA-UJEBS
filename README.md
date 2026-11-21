# Mission Iglesia Universal de Jesucristo El Buen Samaritano

Plataforma web de la iglesia en 5 idiomas (Español, Français, Kreyòl, English, Português).
Tecnología: **Next.js 14 + Supabase + Vercel**. Acceso con correo y contraseña.

> La **Fase 1** (portal de sedes en Python + SQLite) se conserva en [`fase1-python/`](fase1-python/).
> Sus funciones (directorio público de sedes, cuentas por sede) ya están incluidas en esta versión.

## Sedes
- **Directorio público** en la página de inicio: buscar sedes por nombre, país o ciudad.
- **Cuenta general** (sin sede asignada): ve y gestiona todas las sedes y todos los datos.
- **Cuenta de sede**: solo ve y gestiona los datos de su sede. Todo lo que registra se guarda automáticamente en su sede.
- Esta separación la aplica la propia base de datos (Row Level Security), no solo las pantallas.

## Módulos
| Módulo | Quién puede editar |
|---|---|
| ⛪ Sedes | Crear: pastor/admin generales · Editar: secretaría, pastor y admin de esa sede |
| 👥 Miembros · 🏠 Células · 📋 Asistencia | Líder, Secretaría, Pastor, Admin |
| 🎵 Ministerios · 📅 Eventos · 📖 Prédicas · 📢 Anuncios | Secretaría, Pastor, Admin |
| 💝 Diezmos y ofrendas (totales por moneda) | Tesorería, Pastor, Admin (nadie más los ve) |
| 🙏 Peticiones de oración | Cualquier miembro envía; líderes gestionan |
| ⚙️ Usuarios, roles y sede | Solo Admin |

Todos los registros se pueden crear, editar y eliminar según el rol.

## Puesta en marcha
1. **Supabase** → proyecto nuevo → *SQL Editor* → pega `supabase/migrations/0001_iglesia.sql` → **Run**.
2. *Authentication → Providers → Email*: activo. (Opcional: desactiva "Confirm email".)
3. **Vercel** → *Add New Project* → importa este repositorio → variables de `.env.example`
   (Supabase → *Project Settings → API*) → **Deploy**.
4. Entra al sitio y **crea la primera cuenta: será el administrador general**.
5. En *Panel → Sedes* registra las sedes y en *Usuarios y roles* asigna rol y sede a cada persona.

## Personalizar
- Nombre, dirección, horarios, versículo: `config/site.ts`
- Colores: `tailwind.config.ts`
- Textos e idiomas: `dictionaries/`
- Nuevo módulo: entrada en `lib/modules.ts` + tabla en SQL + textos en los diccionarios.

## Desarrollo local
```bash
cp .env.example .env.local   # completa tus claves
npm install
npm run dev
```
