-- Fase 3: formación, visitas, turnos de servicio, inventario, transmisiones y gastos

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null, teacher text, schedule text, starts_on date, description text,
  is_open boolean not null default true,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled','completed','dropped')),
  grade text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  full_name text not null, phone text, email text,
  visit_date date not null default current_date, invited_by text,
  status text not null default 'new' check (status in ('new','contacted','returning','member')),
  notes text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.service_roster (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  date date not null, ministry_id uuid references public.ministries(id) on delete set null,
  task text not null, member_id uuid references public.members(id) on delete set null, notes text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  item text not null, category text, quantity int not null default 1 check (quantity >= 0),
  location text, condition text check (condition in ('good','fair','poor')), notes text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.livestreams (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null, youtube_url text not null, starts_at timestamptz not null,
  is_live boolean not null default false,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete restrict,
  date date not null,
  category text not null check (category in ('rent','utilities','salaries','missions','events','maintenance','supplies','other')),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'CLP',
  description text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['courses','enrollments','visitors','service_roster','inventory','livestreams','expenses'] loop
    execute format('drop trigger if exists force_site on public.%I', t);
    execute format('create trigger force_site before insert or update on public.%I for each row execute function public.force_site()', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Lectura
create policy "leer cursos" on public.courses for select to authenticated using (public.site_readable(site_id));
create policy "leer turnos" on public.service_roster for select to authenticated using (public.site_readable(site_id));
create policy "leer transmisiones" on public.livestreams for select to authenticated using (public.site_readable(site_id));
create policy "transmisiones públicas" on public.livestreams for select to anon using (true);
create policy "leer inscripciones" on public.enrollments for select to authenticated
  using (public.site_readable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "leer visitas" on public.visitors for select to authenticated
  using (public.site_readable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "leer inventario" on public.inventory for select to authenticated
  using (public.site_readable(site_id) and public.has_role(array['secretaria','tesorero','pastor','admin']));
create policy "leer gastos" on public.expenses for select to authenticated
  using (public.site_writable(site_id) and public.has_role(array['tesorero','pastor','admin']));

-- Escritura
create policy "escribir cursos" on public.courses for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir inscripciones" on public.enrollments for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir visitas" on public.visitors for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir turnos" on public.service_roster for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['lider','secretaria','pastor','admin']));
create policy "escribir inventario" on public.inventory for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']));
create policy "escribir transmisiones" on public.livestreams for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['secretaria','pastor','admin']));
create policy "escribir gastos" on public.expenses for all to authenticated
  using (public.site_writable(site_id) and public.has_role(array['tesorero','pastor','admin']))
  with check (public.site_writable(site_id) and public.has_role(array['tesorero','pastor','admin']));

-- Cada usuario puede actualizar su propio nombre (no su rol ni su sede)
create or replace function public.update_my_name(new_name text)
returns void language sql security definer set search_path = public as $$
  update public.profiles set full_name = left(new_name, 120) where id = auth.uid();
$$;
revoke execute on function public.update_my_name(text) from public, anon;
grant execute on function public.update_my_name(text) to authenticated;

-- Índices para el dashboard
create index if not exists idx_members_site on public.members(site_id);
create index if not exists idx_attendance_date on public.attendance(date desc);
create index if not exists idx_donations_date on public.donations(date desc);
create index if not exists idx_expenses_date on public.expenses(date desc);
create index if not exists idx_visitors_date on public.visitors(visit_date desc);
