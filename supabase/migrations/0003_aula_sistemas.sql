-- Fase 4: Aula virtual + motor de 200 sistemas

-- =================== AULA VIRTUAL ===================
alter table public.courses add column if not exists live_url text;
alter table public.courses add column if not exists level text;
alter table public.courses add column if not exists cover_url text;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  position int not null default 1,
  title text not null, content text, video_url text, material_url text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null, instructions text, due_at timestamptz, points int not null default 100,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  student_name text, content text, link text, grade numeric(6,2), feedback text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(),
  unique (assignment_id, user_id)
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  position int not null default 1,
  question text not null, option_a text not null, option_b text not null, option_c text, option_d text,
  correct text not null check (correct in ('a','b','c','d')),
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.course_students (
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create table if not exists public.lesson_progress (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  score int not null, total int not null,
  taken_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['lessons','assignments','submissions','quiz_questions'] loop
    execute format('drop trigger if exists force_site on public.%I', t);
    execute format('create trigger force_site before insert or update on public.%I for each row execute function public.force_site()', t);
  end loop;
  foreach t in array array['lessons','assignments','submissions','quiz_questions','course_students','lesson_progress','quiz_results'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create or replace function public.is_leader()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['lider','secretaria','pastor','admin']);
$$;

create or replace function public.is_enrolled(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.course_students where course_id = c and user_id = auth.uid());
$$;

-- Lecciones y tareas: las ve cualquier usuario con sesión de la sede; las edita el liderazgo
create policy "ver lecciones" on public.lessons for select to authenticated using (public.site_readable(site_id));
create policy "editar lecciones" on public.lessons for all to authenticated
  using (public.site_writable(site_id) and public.is_leader()) with check (public.site_writable(site_id) and public.is_leader());
create policy "ver tareas" on public.assignments for select to authenticated using (public.site_readable(site_id));
create policy "editar tareas" on public.assignments for all to authenticated
  using (public.site_writable(site_id) and public.is_leader()) with check (public.site_writable(site_id) and public.is_leader());

-- Preguntas de examen: solo el liderazgo ve las respuestas correctas
create policy "ver preguntas (maestros)" on public.quiz_questions for select to authenticated using (public.site_readable(site_id) and public.is_leader());
create policy "editar preguntas" on public.quiz_questions for all to authenticated
  using (public.site_writable(site_id) and public.is_leader()) with check (public.site_writable(site_id) and public.is_leader());

-- Inscripción: cada uno se inscribe solo en cursos abiertos
create policy "ver inscripciones aula" on public.course_students for select to authenticated using (user_id = auth.uid() or public.is_leader());
create policy "inscribirme" on public.course_students for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.courses c where c.id = course_id and c.is_open));
create policy "salirme" on public.course_students for delete to authenticated using (user_id = auth.uid() or public.is_leader());

-- Progreso
create policy "ver progreso" on public.lesson_progress for select to authenticated using (user_id = auth.uid() or public.is_leader());
create policy "marcar progreso" on public.lesson_progress for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.lessons l where l.id = lesson_id and public.is_enrolled(l.course_id)));
create policy "desmarcar progreso" on public.lesson_progress for delete to authenticated using (user_id = auth.uid());

-- Entregas: el alumno entrega y corrige mientras no tenga nota; el maestro califica
create policy "ver entregas" on public.submissions for select to authenticated
  using (user_id = auth.uid() or (public.is_leader() and public.site_readable(site_id)));
create policy "entregar" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and grade is null and feedback is null
              and exists (select 1 from public.assignments a where a.id = assignment_id and public.is_enrolled(a.course_id)));
create policy "corregir mi entrega" on public.submissions for update to authenticated
  using (user_id = auth.uid() and grade is null) with check (user_id = auth.uid() and grade is null and feedback is null);
create policy "calificar" on public.submissions for update to authenticated
  using (public.is_leader() and public.site_readable(site_id)) with check (public.is_leader());
create policy "borrar entregas" on public.submissions for delete to authenticated using (public.is_leader() and public.site_writable(site_id));

-- Resultados de examen: solo lectura (se guardan con la función submit_quiz)
create policy "ver resultados" on public.quiz_results for select to authenticated using (user_id = auth.uid() or public.is_leader());

-- Examen sin respuestas para el alumno inscrito
create or replace function public.get_quiz(c uuid)
returns table (id uuid, question text, option_a text, option_b text, option_c text, option_d text)
language sql stable security definer set search_path = public as $$
  select q.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d
  from public.quiz_questions q
  where q.course_id = c and (public.is_enrolled(c) or public.is_leader())
  order by q.position, q.created_at;
$$;

-- Corrige el examen en el servidor y guarda el resultado
create or replace function public.submit_quiz(c uuid, answers jsonb)
returns table (score int, total int)
language plpgsql security definer set search_path = public as $$
declare s int; t int;
begin
  if not public.is_enrolled(c) then raise exception 'not enrolled'; end if;
  select count(*) filter (where lower(answers ->> q.id::text) = q.correct), count(*)
    into s, t from public.quiz_questions q where q.course_id = c;
  insert into public.quiz_results (course_id, user_id, score, total) values (c, auth.uid(), s, t);
  return query select s, t;
end $$;

revoke execute on function public.get_quiz(uuid) from public, anon;
revoke execute on function public.submit_quiz(uuid, jsonb) from public, anon;
revoke execute on function public.is_leader() from public, anon;
revoke execute on function public.is_enrolled(uuid) from public, anon;
grant execute on function public.get_quiz(uuid) to authenticated;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
grant execute on function public.is_leader() to authenticated;
grant execute on function public.is_enrolled(uuid) to authenticated;

create index if not exists idx_lessons_course on public.lessons(course_id, position);
create index if not exists idx_assignments_course on public.assignments(course_id);
create index if not exists idx_submissions_assignment on public.submissions(assignment_id);

-- =================== MOTOR DE 200 SISTEMAS ===================
create table if not exists public.area_access (
  area text primary key,
  read_roles text[] not null,
  write_roles text[] not null
);

insert into public.area_access (area, read_roles, write_roles) values
  ('admin',       '{secretaria,pastor,admin}',                       '{secretaria,pastor,admin}'),
  ('secretaria',  '{secretaria,pastor,admin}',                       '{secretaria,pastor,admin}'),
  ('finanzas',    '{tesorero,pastor,admin}',                         '{tesorero,pastor,admin}'),
  ('pastoral',    '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('discipulado', '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('ninos',       '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('jovenes',     '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('mujeres',     '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('hombres',     '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('familia',     '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('alabanza',    '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('medios',      '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('misiones',    '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('social',      '{lider,secretaria,tesorero,pastor,admin}',        '{lider,secretaria,pastor,admin}'),
  ('eventos',     '{miembro,lider,secretaria,tesorero,pastor,admin}', '{lider,secretaria,pastor,admin}'),
  ('infra',       '{secretaria,tesorero,pastor,admin}',              '{secretaria,pastor,admin}'),
  ('seguridad',   '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('tecnologia',  '{secretaria,pastor,admin}',                       '{secretaria,pastor,admin}'),
  ('voluntarios', '{lider,secretaria,pastor,admin}',                 '{lider,secretaria,pastor,admin}'),
  ('legal',       '{secretaria,pastor,admin}',                       '{pastor,admin}')
on conflict (area) do update set read_roles = excluded.read_roles, write_roles = excluded.write_roles;

alter table public.area_access enable row level security;
create policy "ver accesos" on public.area_access for select to authenticated using (true);

create or replace function public.area_can(a text, mode text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.area_access x join public.profiles p on p.id = auth.uid()
    where x.area = a and p.role = any(case when mode = 'write' then x.write_roles else x.read_roles end)
  );
$$;
revoke execute on function public.area_can(text, text) from public, anon;
grant execute on function public.area_can(text, text) to authenticated;

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module ~ '^[a-z]+\.[a-z0-9_]+$'),
  site_id uuid references public.sites(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 20000),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_records_module on public.records(module, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists force_site on public.records;
create trigger force_site before insert or update on public.records for each row execute function public.force_site();
drop trigger if exists touch on public.records;
create trigger touch before update on public.records for each row execute function public.touch_updated_at();
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

alter table public.records enable row level security;
create policy "leer sistemas" on public.records for select to authenticated
  using (public.site_readable(site_id) and public.area_can(split_part(module, '.', 1), 'read'));
create policy "crear en sistemas" on public.records for insert to authenticated
  with check (public.site_writable(site_id) and public.area_can(split_part(module, '.', 1), 'write'));
create policy "editar sistemas" on public.records for update to authenticated
  using (public.site_writable(site_id) and public.area_can(split_part(module, '.', 1), 'write'))
  with check (public.site_writable(site_id) and public.area_can(split_part(module, '.', 1), 'write'));
create policy "borrar en sistemas" on public.records for delete to authenticated
  using (public.site_writable(site_id) and public.area_can(split_part(module, '.', 1), 'write'));
