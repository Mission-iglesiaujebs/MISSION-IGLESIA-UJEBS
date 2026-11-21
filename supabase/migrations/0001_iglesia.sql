-- =====================================================================
-- Mission Iglesia Universal de Jesucristo El Buen Samaritano — esquema
-- Pega este archivo completo en Supabase → SQL Editor → Run
--
-- Sedes: cada cuenta puede ser GENERAL (sin sede: ve y gestiona todo)
-- o DE SEDE (solo ve y gestiona los datos de su sede).
-- =====================================================================

-- ---------- Sedes ----------
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120),
  country text not null check (char_length(country) <= 120),
  city text not null check (char_length(city) <= 120),
  address text,
  schedule text,
  pastor_name text,
  phone text,
  published boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------- Perfiles y roles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'miembro'
    check (role in ('miembro','lider','secretaria','tesorero','pastor','admin')),
  site_id uuid references public.sites(id) on delete set null, -- null = cuenta general
  created_at timestamptz not null default now()
);

-- El PRIMER usuario registrado queda como administrador general; los demás como miembros.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    case when exists (select 1 from public.profiles) then 'miembro' else 'admin' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Funciones de permisos ----------
create or replace function public.has_role(allowed text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = any(allowed));
$$;

-- Sede de la cuenta actual (null = general)
create or replace function public.my_site()
returns uuid language sql stable security definer set search_path = public as $$
  select site_id from public.profiles where id = auth.uid();
$$;

-- Puede LEER datos de esa sede (los datos sin sede son de toda la iglesia)
create or replace function public.site_readable(s uuid)
returns boolean language sql stable as $$
  select public.my_site() is null or s is null or s = public.my_site();
$$;

-- Puede ESCRIBIR datos de esa sede
create or replace function public.site_writable(s uuid)
returns boolean language sql stable as $$
  select public.my_site() is null or s = public.my_site();
$$;

-- Una cuenta de sede siempre guarda en su propia sede
create or replace function public.force_site()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.my_site() is not null then
    new.site_id := public.my_site();
  end if;
  return new;
end $$;

-- ---------- Tablas de la iglesia ----------
create table if not exists public.cells (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  name text not null, leader_name text, meeting_day text, address text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  name text not null, leader_name text, description text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete set null,
  full_name text not null, email text, phone text, birth_date date, address text, country text,
  baptized boolean not null default false,
  status text check (status in ('active','visitor','inactive')),
  cell_id uuid references public.cells(id) on delete set null,
  ministry_id uuid references public.ministries(id) on delete set null,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  date date not null, service text not null,
  cell_id uuid references public.cells(id) on delete set null,
  adults int, children int, visitors int, notes text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null, starts_at timestamptz not null, location text, description text,
  is_public boolean not null default true,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null, preacher text, date date, bible_passage text,
  video_url text, audio_url text, summary text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete restrict,
  date date not null,
  kind text not null check (kind in ('tithe','offering','missions','building','other')),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'CLP',
  method text check (method in ('cash','transfer','card')),
  member_id uuid references public.members(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null, body text not null, is_public boolean not null default true,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  name text, request text not null, is_public boolean not null default false,
  status text not null default 'pending' check (status in ('pending','praying','answered')),
  created_by uuid references auth.users(id) default auth.uid(), created_at timestamptz not null default now()
);

-- Trigger de sede en todas las tablas por sede
do $$
declare t text;
begin
  foreach t in array array['cells','ministries','members','attendance','events','sermons','donations','announcements','prayer_requests'] loop
    execute format('drop trigger if exists force_site on public.%I', t);
    execute format('create trigger force_site before insert or update on public.%I for each row execute function public.force_site()', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

alter table public.sites    enable row level security;
alter table public.profiles enable row level security;

-- ---------- Políticas: sedes ----------
create policy "sedes publicadas" on public.sites for select to anon using (published);
create policy "ver sedes" on public.sites for select to authenticated
  using (published or public.site_writable(id));
create policy "crear sede" on public.sites for insert to authenticated
  with check (public.my_site() is null and public.has_role(array['pastor','admin']));
create policy "editar sede" on public.sites for update to authenticated
  using (public.site_writable(id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(id));
create policy "borrar sede" on public.sites for delete to authenticated
  using (public.my_site() is null and public.has_role(array['admin']));

-- ---------- Políticas: perfiles ----------
create policy "perfil propio o equipo" on public.profiles for select to authenticated
  using (id = auth.uid() or (public.has_role(array['secretaria','pastor','admin']) and public.site_writable(site_id)));
create policy "admin asigna rol y sede" on public.profiles for update to authenticated
  using (public.has_role(array['admin']) and public.site_writable(site_id))
  with check (public.site_writable(site_id));

-- ---------- Contenido público (sin iniciar sesión) ----------
create policy "eventos públicos" on public.events for select to anon using (is_public);
create policy "anuncios públicos" on public.announcements for select to anon using (is_public);
create policy "prédicas públicas" on public.sermons for select to anon using (true);

-- ---------- Lectura con sesión (limitada a la sede) ----------
create policy "leer células" on public.cells for select to authenticated using (public.site_readable(site_id));
create policy "leer ministerios" on public.ministries for select to authenticated using (public.site_readable(site_id));
create policy "leer eventos" on public.events for select to authenticated using (public.site_readable(site_id));
create policy "leer prédicas" on public.sermons for select to authenticated using (public.site_readable(site_id));
create policy "leer anuncios" on public.announcements for select to authenticated using (public.site_readable(site_id));
create policy "leer miembros" on public.members for select to authenticated
  using (public.site_readable(site_id) and public.has_role(array['lider','secretaria','tesorero','pastor','admin']));
create policy "leer asistencia" on public.attendance for select to authenticated
  using (public.site_readable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "leer ofrendas" on public.donations for select to authenticated
  using (public.site_writable(site_id) and public.has_role(array['tesorero','pastor','admin']));

-- ---------- Escritura por rol y sede ----------
create policy "escribir ofrendas" on public.donations for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['tesorero','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['tesorero','pastor','admin']));
create policy "escribir miembros" on public.members for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir células" on public.cells for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir asistencia" on public.attendance for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir ministerios" on public.ministries for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']));
create policy "escribir eventos" on public.events for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']));
create policy "escribir prédicas" on public.sermons for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']));
create policy "escribir anuncios" on public.announcements for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']));

-- ---------- Peticiones de oración ----------
create policy "enviar petición" on public.prayer_requests for insert to authenticated
  with check (created_by = auth.uid() and (status = 'pending' or public.has_role(array['lider','secretaria','pastor','admin'])));
create policy "ver peticiones" on public.prayer_requests for select to authenticated
  using (created_by = auth.uid()
         or (public.site_readable(site_id) and (is_public or public.has_role(array['lider','secretaria','pastor','admin']))));
create policy "gestionar peticiones" on public.prayer_requests for update to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "borrar peticiones" on public.prayer_requests for delete to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
