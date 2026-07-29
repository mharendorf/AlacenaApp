-- Alacena — esquema inicial (households, profiles, items) + RLS + RPCs de invitación.

create table public.households (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo_invitacion text not null unique,
  ultima_fecha_compra timestamptz,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  email text not null unique,
  household_id uuid references public.households(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  nombre text not null,
  marca text,
  variedad text,
  cantidad numeric not null check (cantidad > 0),
  unidad text not null check (unidad in ('unidad', 'litro', 'kg', 'paquete')),
  categoria text not null check (categoria in ('almacen', 'bebidas', 'higiene', 'frescos', 'limpieza', 'varios')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'comprado')),
  is_deleted boolean not null default false,
  creado_por uuid references public.profiles(id),
  modificado_por uuid references public.profiles(id),
  fecha_creacion timestamptz not null default now(),
  fecha_modificacion timestamptz not null default now()
);

create index items_household_idx on public.items (household_id) where is_deleted = false;

-- security definer: evita la recursión de RLS que causaría leer household_id
-- directamente desde una policy sobre profiles.
create or replace function public.current_household_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

-- profiles se crea automáticamente al hacer signup en auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'nombre', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.items enable row level security;

create policy households_select on public.households
  for select using (id = public.current_household_id());

create policy households_update on public.households
  for update using (id = public.current_household_id())
  with check (id = public.current_household_id());

-- Sin policy de insert/delete directa sobre households: se hace solo vía los
-- RPCs create_household/join_household de abajo.

create policy profiles_select on public.profiles
  for select using (id = auth.uid() or household_id = public.current_household_id());

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy items_select on public.items
  for select using (household_id = public.current_household_id());

create policy items_insert on public.items
  for insert with check (household_id = public.current_household_id());

create policy items_update on public.items
  for update using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy items_delete on public.items
  for delete using (household_id = public.current_household_id());

-- Regla técnica del funcional: no se puede borrar un hogar con usuarios.
create or replace function public.prevent_household_delete_with_users()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.profiles where household_id = old.id) then
    raise exception 'cannot delete household with members';
  end if;
  return old;
end;
$$;

create trigger households_prevent_delete
  before delete on public.households
  for each row execute function public.prevent_household_delete_with_users();

-- Generación de código de invitación (formato CASA-XXXX).
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  code := 'CASA-';
  for i in 1..4 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return code;
end;
$$;

-- Crear hogar: security definer porque un usuario sin household todavía no
-- puede insertar/leer households bajo RLS.
create or replace function public.create_household(p_nombre text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_household public.households;
  v_tries int := 0;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and household_id is not null) then
    raise exception 'user already belongs to a household';
  end if;

  loop
    v_code := public.generate_invite_code();
    begin
      insert into public.households (nombre, codigo_invitacion)
      values (p_nombre, v_code)
      returning * into v_household;
      exit;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 10 then
        raise exception 'could not generate unique invite code';
      end if;
    end;
  end loop;

  update public.profiles set household_id = v_household.id where id = auth.uid();
  return v_household;
end;
$$;

-- Unirse a un hogar por código: idem, bypassea RLS de forma controlada
-- (solo devuelve el household exacto que matchea el código, sin enumeración).
create or replace function public.join_household(p_codigo text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household public.households;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and household_id is not null) then
    raise exception 'user already belongs to a household';
  end if;

  select * into v_household from public.households
  where upper(codigo_invitacion) = upper(trim(p_codigo));

  if not found then
    raise exception 'invalid invite code';
  end if;

  update public.profiles set household_id = v_household.id where id = auth.uid();
  return v_household;
end;
$$;

grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;
