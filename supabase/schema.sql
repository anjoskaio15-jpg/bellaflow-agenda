create extension if not exists "uuid-ossp";

create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  whatsapp text not null,
  email text,
  address text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'agency')),
  primary_color text not null default '#C98F9B',
  secondary_color text not null default '#F4DDE2',
  background_color text not null default '#FFF8F8',
  foreground_color text not null default '#2F2528',
  card_color text not null default '#FFFFFF',
  border_color text not null default '#E8D4D8',
  muted_color text not null default '#8D747A',
  success_color text not null default '#4CAF50',
  danger_color text not null default '#D9534F',
  booking_text text default 'Escolha seu servico e reserve seu horario em poucos passos.',
  confirmation_text text default 'Seu pedido de horario foi criado. Confirme pelo WhatsApp para garantir seu atendimento.',
  powered_by_enabled boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_users (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'professional', 'agency', 'dev')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services add column if not exists deleted_at timestamptz;

create table if not exists public.schedules (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  is_working_day boolean not null default true,
  start_time time not null,
  end_time time not null,
  slot_interval_minutes int not null default 30 check (slot_interval_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, weekday),
  check (start_time < end_time)
);

create table if not exists public.blocked_dates (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  blocked_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (business_id, blocked_date)
);

create table if not exists public.schedule_overrides (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  override_date date not null,
  slot_time time not null,
  type text not null check (type in ('extra', 'removed')),
  created_at timestamptz not null default now(),
  unique (business_id, override_date, slot_time)
);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_name text not null check (char_length(trim(client_name)) >= 2),
  client_whatsapp text not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  service_ids uuid[] not null check (array_length(service_ids, 1) between 1 and 3),
  total_duration_minutes int not null check (total_duration_minutes > 0),
  total_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create unique index if not exists bookings_no_double_active
on public.bookings (business_id, booking_date, start_time)
where status in ('pending', 'confirmed');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_businesses_updated_at on public.businesses;
create trigger touch_businesses_updated_at before update on public.businesses
for each row execute function public.touch_updated_at();

drop trigger if exists touch_services_updated_at on public.services;
create trigger touch_services_updated_at before update on public.services
for each row execute function public.touch_updated_at();

drop trigger if exists touch_schedules_updated_at on public.schedules;
create trigger touch_schedules_updated_at before update on public.schedules
for each row execute function public.touch_updated_at();

drop trigger if exists touch_bookings_updated_at on public.bookings;
create trigger touch_bookings_updated_at before update on public.bookings
for each row execute function public.touch_updated_at();

create or replace function public.user_has_business_access(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_users bu
    where bu.business_id = target_business_id
      and bu.user_id = auth.uid()
  );
$$;

create or replace function public.user_has_business_role(target_business_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_users bu
    where bu.business_id = target_business_id
      and bu.user_id = auth.uid()
      and bu.role = any(allowed_roles)
  );
$$;

create or replace function public.prevent_invalid_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_weekday int;
  schedule_row public.schedules%rowtype;
  blocked boolean;
begin
  target_weekday := extract(dow from new.booking_date)::int;

  select * into schedule_row
  from public.schedules
  where business_id = new.business_id and weekday = target_weekday;

  if schedule_row.id is null or schedule_row.is_working_day is false then
    raise exception 'Data fora dos dias de atendimento.';
  end if;

  select exists (
    select 1 from public.blocked_dates
    where business_id = new.business_id and blocked_date = new.booking_date
  ) into blocked;

  if blocked then
    raise exception 'Data bloqueada para agendamentos.';
  end if;

  if new.start_time < schedule_row.start_time or new.end_time > schedule_row.end_time then
    raise exception 'Horario fora do expediente.';
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.business_id = new.business_id
      and b.booking_date = new.booking_date
      and b.status in ('pending', 'confirmed')
      and tstzrange(
        (b.booking_date::text || ' ' || b.start_time::text)::timestamptz,
        (b.booking_date::text || ' ' || b.end_time::text)::timestamptz,
        '[)'
      ) && tstzrange(
        (new.booking_date::text || ' ' || new.start_time::text)::timestamptz,
        (new.booking_date::text || ' ' || new.end_time::text)::timestamptz,
        '[)'
      )
  ) then
    raise exception 'Horario ja possui agendamento.';
  end if;

  if exists (
    select 1
    from public.schedule_overrides so
    where so.business_id = new.business_id
      and so.override_date = new.booking_date
      and so.slot_time = new.start_time
      and so.type = 'removed'
  ) then
    raise exception 'Horario indisponivel.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_booking_before_insert on public.bookings;
create trigger validate_booking_before_insert before insert on public.bookings
for each row execute function public.prevent_invalid_booking();

alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.services enable row level security;
alter table public.schedules enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.schedule_overrides enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "public can read active businesses" on public.businesses;
create policy "public can read active businesses"
on public.businesses for select
using (is_active = true);

drop policy if exists "business users can update businesses" on public.businesses;
create policy "business users can update businesses"
on public.businesses for update
using (public.user_has_business_role(id, array['owner', 'agency', 'dev']))
with check (public.user_has_business_role(id, array['owner', 'agency', 'dev']));

drop policy if exists "agency can create businesses" on public.businesses;
create policy "agency can create businesses"
on public.businesses for insert
with check (auth.uid() is not null);

drop policy if exists "business users can read membership" on public.business_users;
create policy "business users can read membership"
on public.business_users for select
using (user_id = auth.uid() or public.user_has_business_access(business_id));

drop policy if exists "owners manage membership" on public.business_users;
create policy "owners manage membership"
on public.business_users for all
using (public.user_has_business_role(business_id, array['owner', 'agency', 'dev']))
with check (public.user_has_business_role(business_id, array['owner', 'agency', 'dev']));

drop policy if exists "authenticated user can claim new business" on public.business_users;
create policy "authenticated user can claim new business"
on public.business_users for insert
with check (
  user_id = auth.uid()
  and role = 'owner'
  and not exists (
    select 1 from public.business_users existing
    where existing.business_id = business_users.business_id
  )
);

drop policy if exists "public can read active services" on public.services;
create policy "public can read active services"
on public.services for select
to anon
using (
  is_active = true
  and deleted_at is null
  and exists (
    select 1 from public.businesses b
    where b.id = services.business_id and b.is_active = true
  )
);

drop policy if exists "business users manage services" on public.services;
create policy "business users manage services"
on public.services for all
to authenticated
using (public.user_has_business_access(business_id))
with check (public.user_has_business_access(business_id));

drop policy if exists "public can read schedules" on public.schedules;
create policy "public can read schedules"
on public.schedules for select
using (
  exists (
    select 1 from public.businesses b
    where b.id = schedules.business_id and b.is_active = true
  )
);

drop policy if exists "business users manage schedules" on public.schedules;
create policy "business users manage schedules"
on public.schedules for all
using (public.user_has_business_access(business_id))
with check (public.user_has_business_access(business_id));

drop policy if exists "public can read blocked dates" on public.blocked_dates;
create policy "public can read blocked dates"
on public.blocked_dates for select
using (
  exists (
    select 1 from public.businesses b
    where b.id = blocked_dates.business_id and b.is_active = true
  )
);

drop policy if exists "business users manage blocked dates" on public.blocked_dates;
create policy "business users manage blocked dates"
on public.blocked_dates for all
using (public.user_has_business_access(business_id))
with check (public.user_has_business_access(business_id));

drop policy if exists "public can read schedule overrides" on public.schedule_overrides;
create policy "public can read schedule overrides"
on public.schedule_overrides for select
using (
  exists (
    select 1 from public.businesses b
    where b.id = schedule_overrides.business_id and b.is_active = true
  )
);

drop policy if exists "business users manage schedule overrides" on public.schedule_overrides;
create policy "business users manage schedule overrides"
on public.schedule_overrides for all
using (public.user_has_business_access(business_id))
with check (public.user_has_business_access(business_id));

drop policy if exists "public can create bookings" on public.bookings;
create policy "public can create bookings"
on public.bookings for insert
with check (
  status = 'pending'
  and exists (
    select 1 from public.businesses b
    where b.id = bookings.business_id and b.is_active = true
  )
);

drop policy if exists "business users can read bookings" on public.bookings;
create policy "business users can read bookings"
on public.bookings for select
using (public.user_has_business_access(business_id));

drop policy if exists "business users can update bookings" on public.bookings;
create policy "business users can update bookings"
on public.bookings for update
using (public.user_has_business_access(business_id))
with check (public.user_has_business_access(business_id));

insert into public.businesses (
  name, slug, description, whatsapp, email, address, plan, booking_text
) values (
  'Studio Bella Rosa',
  'bella-rosa',
  'Design de sobrancelhas, unhas, cilios e estetica facial.',
  '5585999999999',
  'contato@bellarosa.com',
  'Rua das Flores, 123 - Fortaleza, CE',
  'starter',
  'Escolha ate 3 servicos e reserve seu horario em poucos passos.'
) on conflict (slug) do nothing;

insert into public.services (business_id, name, description, duration_minutes, price)
select id, 'Design de Sobrancelhas', 'Mapeamento e finalizacao natural.', 45, 60
from public.businesses where slug = 'bella-rosa'
on conflict do nothing;

insert into public.services (business_id, name, description, duration_minutes, price)
select id, 'Manicure', 'Cutilagem e esmaltacao profissional.', 60, 50
from public.businesses where slug = 'bella-rosa'
on conflict do nothing;

insert into public.services (business_id, name, description, duration_minutes, price)
select id, 'Extensao de Cilios', 'Aplicacao fio a fio com acabamento leve.', 120, 180
from public.businesses where slug = 'bella-rosa'
on conflict do nothing;

insert into public.schedules (business_id, weekday, is_working_day, start_time, end_time, slot_interval_minutes)
select id, weekday, weekday between 1 and 6, '09:00', '18:00', 30
from public.businesses
cross join generate_series(0, 6) as weekday
where slug = 'bella-rosa'
on conflict (business_id, weekday) do nothing;

insert into public.businesses (
  name,
  slug,
  description,
  whatsapp,
  email,
  address,
  plan,
  primary_color,
  secondary_color,
  background_color,
  foreground_color,
  card_color,
  border_color,
  muted_color,
  booking_text,
  confirmation_text,
  powered_by_enabled,
  is_active
) values (
  'Taina Melo Beauty',
  'taina-melo',
  'Desde 2020, elevando autoestima em Natal/RN. Unhas, cabelo, cilios e beleza feminina com atendimento por horario marcado.',
  '5584999999999',
  'contato@tainamelobeauty.com',
  'Natal/RN',
  'pro',
  '#C98F9B',
  '#F3DDE2',
  '#FFF8F8',
  '#2A1D1F',
  '#FFFFFF',
  '#E8C8CF',
  '#8D747A',
  'Escolha seu servico, selecione o melhor horario e confirme pelo WhatsApp.',
  'Seu horario esta quase confirmado. Toque no botao abaixo para enviar os detalhes pelo WhatsApp.',
  false,
  true
) on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  address = excluded.address,
  plan = excluded.plan,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  background_color = excluded.background_color,
  foreground_color = excluded.foreground_color,
  card_color = excluded.card_color,
  border_color = excluded.border_color,
  muted_color = excluded.muted_color,
  booking_text = excluded.booking_text,
  confirmation_text = excluded.confirmation_text,
  powered_by_enabled = excluded.powered_by_enabled,
  is_active = true;

insert into public.services (business_id, name, description, duration_minutes, price, is_active)
select b.id, s.name, s.description, s.duration_minutes, s.price, true
from public.businesses b
cross join (
  values
    ('Alongamento de unhas', 'Alongamento com acabamento delicado e duradouro.', 120, 180.00),
    ('Manutencao de alongamento', 'Manutencao tecnica para preservar beleza e resistencia.', 90, 120.00),
    ('Manicure em gel', 'Cuidado completo com acabamento em gel.', 75, 90.00),
    ('Esmaltacao em gel', 'Brilho intenso e maior durabilidade para as unhas.', 60, 75.00),
    ('Nail art', 'Decoracao personalizada para deixar suas unhas unicas.', 45, 60.00),
    ('Cutilagem + esmaltacao', 'Cuidado das cuticulas com esmaltacao profissional.', 60, 55.00),
    ('Design de sobrancelhas', 'Modelagem para valorizar o olhar com naturalidade.', 45, 50.00),
    ('Extensao de cilios', 'Aplicacao para destacar o olhar com acabamento feminino.', 120, 160.00),
    ('Manutencao de cilios', 'Manutencao para manter volume e acabamento.', 75, 100.00),
    ('Finalizacao de cabelo', 'Escova, modelagem e finalizacao para ocasioes especiais.', 60, 80.00)
) as s(name, description, duration_minutes, price)
where b.slug = 'taina-melo'
  and not exists (
    select 1 from public.services existing
    where existing.business_id = b.id and existing.name = s.name
  );

insert into public.schedules (business_id, weekday, is_working_day, start_time, end_time, slot_interval_minutes)
select id, weekday, weekday between 1 and 6, '09:00', '18:00', 30
from public.businesses
cross join generate_series(0, 6) as weekday
where slug = 'taina-melo'
on conflict (business_id, weekday) do nothing;
