-- =====================================================================
-- Fase 5: regiones, iglesias independientes, roles personalizados,
-- módulos reutilizables, configuración/logo, fotos, cupos y auditoría
-- =====================================================================

-- ---------- Regiones (Región → país → iglesia) ----------
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120),
  description text check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.sites add column if not exists region_id uuid references public.regions(id) on delete set null;
alter table public.sites add column if not exists logo_path text check (char_length(logo_path) <= 300);
alter table public.sites add column if not exists cover_path text check (char_length(cover_path) <= 300);
alter table public.sites add column if not exists about text check (char_length(about) <= 5000);
alter table public.sites add column if not exists email text check (char_length(email) <= 200);
alter table public.sites add column if not exists youtube text check (char_length(youtube) <= 300);
alter table public.sites add column if not exists facebook text check (char_length(facebook) <= 300);
alter table public.sites add column if not exists instagram text check (char_length(instagram) <= 300);
alter table public.sites add column if not exists whatsapp text check (char_length(whatsapp) <= 60);

alter table public.profiles add column if not exists region_id uuid references public.regions(id) on delete set null;
alter table public.profiles add column if not exists avatar_path text check (char_length(avatar_path) <= 300);
alter table public.profiles add column if not exists phone text check (char_length(phone) <= 60);

-- Región de la cuenta actual (solo cuentas sin iglesia; null = cuenta general de toda la misión)
create or replace function public.my_region()
returns uuid language sql stable security definer set search_path = public as $$
  select region_id from public.profiles where id = auth.uid() and site_id is null;
$$;

create or replace function public.site_region(s uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select region_id from public.sites where id = s;
$$;

-- Cuenta general (toda la misión): sin iglesia y sin región
create or replace function public.is_global()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and site_id is null and region_id is null);
$$;

-- LEER: general → todo; regional → iglesias de su región + datos de toda la misión; iglesia → la suya + datos de toda la misión
create or replace function public.site_readable(s uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select s is null
      or public.is_global()
      or s = public.my_site()
      or (public.my_site() is null and public.my_region() is not null and public.site_region(s) = public.my_region());
$$;

-- ESCRIBIR: general → todo; regional → solo iglesias de su región; iglesia → solo la suya
create or replace function public.site_writable(s uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_global()
      or (s is not null and s = public.my_site())
      or (s is not null and public.my_site() is null and public.my_region() is not null and public.site_region(s) = public.my_region());
$$;

-- Una iglesia no puede cambiarse de región; una cuenta regional solo crea iglesias en su región
create or replace function public.guard_site_region()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_global() then return new; end if;
  if public.my_region() is not null then
    new.region_id := public.my_region();
  elsif tg_op = 'UPDATE' then
    new.region_id := old.region_id;
  end if;
  return new;
end $$;
drop trigger if exists guard_site_region on public.sites;
create trigger guard_site_region before insert or update on public.sites for each row execute function public.guard_site_region();

-- Solo la cuenta general puede crear o mover cuentas regionales
create or replace function public.guard_profile_scope()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_global() then return new; end if;
  if new.region_id is distinct from old.region_id then new.region_id := old.region_id; end if;
  return new;
end $$;
drop trigger if exists guard_profile_scope on public.profiles;
create trigger guard_profile_scope before update on public.profiles for each row execute function public.guard_profile_scope();

alter table public.regions enable row level security;
drop policy if exists "ver regiones" on public.regions;
create policy "ver regiones" on public.regions for select using (true);
drop policy if exists "gestionar regiones" on public.regions;
create policy "gestionar regiones" on public.regions for all to authenticated
  using (public.is_global() and public.has_role(array['pastor','admin']))
  with check (public.is_global() and public.has_role(array['pastor','admin']));

drop policy if exists "ver sedes" on public.sites;
create policy "ver sedes" on public.sites for select to authenticated
  using (published or public.site_writable(id) or (region_id is not null and region_id = public.my_region()));

-- Las cuentas regionales también pueden crear iglesias (en su región)
drop policy if exists "crear sede" on public.sites;
create policy "crear sede" on public.sites for insert to authenticated
  with check (public.my_site() is null and public.has_role(array['pastor','admin']));
drop policy if exists "borrar sede" on public.sites;
create policy "borrar sede" on public.sites for delete to authenticated
  using (public.my_site() is null and public.site_writable(id) and public.has_role(array['admin']));

-- Perfiles: el admin regional administra las cuentas de las iglesias de su región
drop policy if exists "perfil propio o equipo" on public.profiles;
create policy "perfil propio o equipo" on public.profiles for select to authenticated
  using (id = auth.uid() or (public.has_role(array['secretaria','pastor','admin']) and public.site_writable(site_id)));

-- Datos del propio perfil (nombre, teléfono, foto)
create or replace function public.update_my_profile(new_name text, new_phone text, new_avatar text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if new_avatar is not null and new_avatar <> '' and new_avatar not like 'avatars/' || auth.uid()::text || '/%' then
    raise exception 'invalid_avatar';
  end if;
  update public.profiles set
    full_name = coalesce(nullif(left(trim(new_name), 120), ''), full_name),
    phone = nullif(left(trim(coalesce(new_phone, '')), 60), ''),
    avatar_path = case when new_avatar is null then avatar_path else nullif(new_avatar, '') end
  where id = auth.uid();
end $$;
revoke execute on function public.update_my_profile(text, text, text) from public, anon;
grant execute on function public.update_my_profile(text, text, text) to authenticated;

-- ---------- Roles personalizados y permisos por área ----------
create table if not exists public.custom_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text check (char_length(description) <= 500),
  base_role text not null default 'miembro' check (base_role in ('miembro','lider','secretaria','tesorero','pastor','admin')),
  site_id uuid references public.sites(id) on delete cascade, -- null = rol de toda la misión
  created_at timestamptz not null default now()
);
create table if not exists public.role_area_perms (
  role_id uuid not null references public.custom_roles(id) on delete cascade,
  area text not null check (area ~ '^[a-z][a-z0-9_]{1,30}$'),
  can_read boolean not null default true,
  can_write boolean not null default false,
  primary key (role_id, area)
);
alter table public.profiles add column if not exists custom_role_id uuid references public.custom_roles(id) on delete set null;

alter table public.custom_roles enable row level security;
alter table public.role_area_perms enable row level security;
drop policy if exists "ver roles" on public.custom_roles;
create policy "ver roles" on public.custom_roles for select to authenticated using (public.site_readable(site_id));
drop policy if exists "gestionar roles" on public.custom_roles;
create policy "gestionar roles" on public.custom_roles for all to authenticated
  using (public.has_role(array['admin']) and public.site_writable(site_id))
  with check (public.has_role(array['admin']) and public.site_writable(site_id));
drop policy if exists "ver permisos de rol" on public.role_area_perms;
create policy "ver permisos de rol" on public.role_area_perms for select to authenticated
  using (exists (select 1 from public.custom_roles r where r.id = role_id and public.site_readable(r.site_id)));
drop policy if exists "gestionar permisos de rol" on public.role_area_perms;
create policy "gestionar permisos de rol" on public.role_area_perms for all to authenticated
  using (public.has_role(array['admin']) and exists (select 1 from public.custom_roles r where r.id = role_id and public.site_writable(r.site_id)))
  with check (public.has_role(array['admin']) and exists (select 1 from public.custom_roles r where r.id = role_id and public.site_writable(r.site_id)));

-- Permiso por área: con rol personalizado manda su tabla de permisos; si no, el rol base
create or replace function public.area_can(a text, mode text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when p.custom_role_id is not null then exists (
      select 1 from public.role_area_perms x
      where x.role_id = p.custom_role_id and x.area = a and (case when mode = 'write' then x.can_write else x.can_read end))
    else exists (
      select 1 from public.area_access x
      where x.area = a and p.role = any(case when mode = 'write' then x.write_roles else x.read_roles end))
  end
  from public.profiles p where p.id = auth.uid();
$$;

-- El admin general ajusta qué roles base ven/editan cada área
drop policy if exists "editar accesos" on public.area_access;
create policy "editar accesos" on public.area_access for all to authenticated
  using (public.is_global() and public.has_role(array['admin']))
  with check (public.is_global() and public.has_role(array['admin']));

-- 10 ministerios nuevos
insert into public.area_access (area, read_roles, write_roles) values
  ('intercesion',   '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('ujieres',       '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('diaconia',      '{lider,secretaria,tesorero,pastor,admin}',        '{secretaria,pastor,admin}'),
  ('escuela',       '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('adolescentes',  '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('celulas',       '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('evangelismo',   '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('consolidacion', '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('capellania',    '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('instituto',     '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}')
on conflict (area) do nothing;

-- ---------- Áreas y módulos reutilizables (creados/editados desde el panel) ----------
create table if not exists public.area_defs (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,30}$'),
  icon text not null default '📁' check (char_length(icon) <= 16),
  labels jsonb not null check (jsonb_typeof(labels) = 'array' and jsonb_array_length(labels) = 5 and pg_column_size(labels) < 2000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.module_defs (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,30}\.[a-z0-9_]{1,40}$'),
  area text not null check (area = split_part(key, '.', 1)),
  icon text not null default '📄' check (char_length(icon) <= 16),
  labels jsonb not null check (jsonb_typeof(labels) = 'array' and jsonb_array_length(labels) = 5 and pg_column_size(labels) < 2000),
  fields jsonb not null default '[]'::jsonb check (jsonb_typeof(fields) = 'array' and jsonb_array_length(fields) <= 30 and pg_column_size(fields) < 20000),
  site_id uuid references public.sites(id) on delete cascade, -- null = para toda la misión
  hidden boolean not null default false,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists touch on public.module_defs;
create trigger touch before update on public.module_defs for each row execute function public.touch_updated_at();

alter table public.area_defs enable row level security;
alter table public.module_defs enable row level security;
drop policy if exists "ver áreas" on public.area_defs;
create policy "ver áreas" on public.area_defs for select to authenticated using (true);
drop policy if exists "gestionar áreas" on public.area_defs;
create policy "gestionar áreas" on public.area_defs for all to authenticated
  using (public.is_global() and public.has_role(array['admin']))
  with check (public.is_global() and public.has_role(array['admin']));
drop policy if exists "ver módulos" on public.module_defs;
create policy "ver módulos" on public.module_defs for select to authenticated using (public.site_readable(site_id));
drop policy if exists "gestionar módulos" on public.module_defs;
create policy "gestionar módulos" on public.module_defs for all to authenticated
  using (public.has_role(array['admin']) and public.site_writable(site_id))
  with check (public.has_role(array['admin']) and public.site_writable(site_id));

-- Las claves de área ahora pueden llevar guion bajo
alter table public.records drop constraint if exists records_module_check;
alter table public.records add constraint records_module_check check (module ~ '^[a-z][a-z0-9_]{1,30}\.[a-z0-9_]{1,40}$');

-- ---------- Configuración general y logo ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  name text check (char_length(name) <= 160),
  short_name text check (char_length(short_name) <= 40),
  tagline text check (char_length(tagline) <= 300),
  verse text check (char_length(verse) <= 120),
  logo_path text check (char_length(logo_path) <= 300),
  primary_color text check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  accent_color text check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  email text check (char_length(email) <= 200),
  phone text check (char_length(phone) <= 60),
  address text check (char_length(address) <= 300),
  youtube text check (char_length(youtube) <= 300),
  facebook text check (char_length(facebook) <= 300),
  instagram text check (char_length(instagram) <= 300),
  whatsapp text check (char_length(whatsapp) <= 60),
  live_url text check (char_length(live_url) <= 300),
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;
alter table public.settings enable row level security;
drop policy if exists "ver configuración" on public.settings;
create policy "ver configuración" on public.settings for select using (true);
drop policy if exists "editar configuración" on public.settings;
create policy "editar configuración" on public.settings for update to authenticated
  using (public.is_global() and public.has_role(array['admin','pastor']))
  with check (public.is_global() and public.has_role(array['admin','pastor']));

-- ---------- Archivos (logo, portadas, fotos de perfil) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: subir foto propia" on storage.objects;
create policy "media: subir foto propia" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "media: cambiar foto propia" on storage.objects;
create policy "media: cambiar foto propia" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "media: borrar foto propia" on storage.objects;
create policy "media: borrar foto propia" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "media: subir marca" on storage.objects;
create policy "media: subir marca" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'branding' and public.has_role(array['secretaria','pastor','admin']));
drop policy if exists "media: borrar marca" on storage.objects;
create policy "media: borrar marca" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'branding' and public.has_role(array['secretaria','pastor','admin']));

-- ---------- Aula: cupos por curso ----------
alter table public.courses add column if not exists capacity int check (capacity is null or capacity between 1 and 100000);

create or replace function public.enforce_course_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap int; taken int;
begin
  select capacity into cap from public.courses where id = new.course_id for update;
  if cap is not null then
    select count(*) into taken from public.course_students where course_id = new.course_id;
    if taken >= cap then raise exception 'course_full' using errcode = 'P0001'; end if;
  end if;
  return new;
end $$;
drop trigger if exists enforce_course_capacity on public.course_students;
create trigger enforce_course_capacity before insert on public.course_students for each row execute function public.enforce_course_capacity();
revoke execute on function public.enforce_course_capacity() from public, anon, authenticated;

-- Inscritos por curso (solo de los cursos que el usuario puede ver)
create or replace function public.course_counts()
returns table (course_id uuid, taken bigint) language sql stable security definer set search_path = public as $$
  select cs.course_id, count(*) from public.course_students cs
  join public.courses c on c.id = cs.course_id
  where public.site_readable(c.site_id)
  group by cs.course_id;
$$;
revoke execute on function public.course_counts() from public, anon;
grant execute on function public.course_counts() to authenticated;

-- ---------- Registro de auditoría ----------
create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid default auth.uid(),
  site_id uuid,
  entity text not null,
  entity_id text,
  action text not null
);
create index if not exists idx_audit_at on public.audit_events(at desc);
alter table public.audit_events enable row level security;
drop policy if exists "ver auditoría" on public.audit_events;
create policy "ver auditoría" on public.audit_events for select to authenticated
  using (public.has_role(array['admin','pastor']) and public.site_readable(site_id));

create or replace function public.audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare r jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_events (site_id, entity, entity_id, action)
  values (case when r ? 'site_id' then nullif(r->>'site_id', '')::uuid
               when tg_table_name = 'sites' then (r->>'id')::uuid end,
          tg_table_name, coalesce(r->>'id', r->>'key'), lower(tg_op));
  return coalesce(new, old);
end $$;
revoke execute on function public.audit() from public, anon, authenticated;

do $$ declare t text; begin
  foreach t in array array['sites','regions','profiles','custom_roles','module_defs','area_defs','settings','records',
                           'members','donations','expenses','courses','events','announcements'] loop
    execute format('drop trigger if exists audit on public.%I', t);
    execute format('create trigger audit after insert or update or delete on public.%I for each row execute function public.audit()', t);
  end loop;
end $$;

revoke execute on function public.my_region(), public.site_region(uuid), public.is_global(),
  public.guard_site_region(), public.guard_profile_scope() from public, anon;
grant execute on function public.my_region(), public.site_region(uuid), public.is_global() to authenticated;
