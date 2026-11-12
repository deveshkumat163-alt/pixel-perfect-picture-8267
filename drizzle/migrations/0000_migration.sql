
-- ========== ROLES ==========
create type public.app_role as enum ('super_admin','admin','project_manager','designer','developer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('super_admin','admin'))
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "Admins read all roles" on public.user_roles for select to authenticated using (public.is_admin(auth.uid()));
create policy "Super admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- ========== SHARED ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ========== SERVICES ==========
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  summary text not null default '',
  overview text not null default '',
  icon text not null default 'Sparkles',
  offerings text[] not null default '{}',
  features jsonb not null default '[]'::jsonb,
  benefits text[] not null default '{}',
  technologies text[] not null default '{}',
  portfolio_category text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "Public reads published services" on public.services for select to anon, authenticated using (is_published = true);
create policy "Staff read all services" on public.services for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins manage services" on public.services for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger services_updated before update on public.services for each row execute function public.set_updated_at();
create index services_sort_idx on public.services (sort_order);

-- ========== PORTFOLIO (public case studies) ==========
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  client_name text not null default '',
  category text not null check (category in ('Web Development','AI Solutions','UI/UX Design','Branding','Creative Design')),
  summary text not null default '',
  description text not null default '',
  challenge text not null default '',
  solution text not null default '',
  features text[] not null default '{}',
  technologies text[] not null default '{}',
  cover_image text,
  screenshots text[] not null default '{}',
  project_url text,
  completed_on date,
  status text not null default 'Completed' check (status in ('Completed','In Progress','Ongoing')),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.portfolio_items to anon;
grant select, insert, update, delete on public.portfolio_items to authenticated;
grant all on public.portfolio_items to service_role;
alter table public.portfolio_items enable row level security;
create policy "Public reads published portfolio" on public.portfolio_items for select to anon, authenticated using (is_published = true);
create policy "Staff read all portfolio" on public.portfolio_items for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins manage portfolio" on public.portfolio_items for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger portfolio_updated before update on public.portfolio_items for each row execute function public.set_updated_at();
create index portfolio_category_idx on public.portfolio_items (category);
create index portfolio_sort_idx on public.portfolio_items (sort_order);

-- ========== TESTIMONIALS ==========
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text not null default '',
  company text not null default '',
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  avatar_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "Public reads published testimonials" on public.testimonials for select to anon, authenticated using (is_published = true);
create policy "Staff read all testimonials" on public.testimonials for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins manage testimonials" on public.testimonials for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger testimonials_updated before update on public.testimonials for each row execute function public.set_updated_at();

-- ========== FAQS ==========
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "Public reads published faqs" on public.faqs for select to anon, authenticated using (is_published = true);
create policy "Staff read all faqs" on public.faqs for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins manage faqs" on public.faqs for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger faqs_updated before update on public.faqs for each row execute function public.set_updated_at();
create index faqs_service_idx on public.faqs (service_id);

-- ========== WEBSITE CONTENT (public CMS key/value) ==========
create table public.website_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.website_content to anon;
grant select, insert, update, delete on public.website_content to authenticated;
grant all on public.website_content to service_role;
alter table public.website_content enable row level security;
create policy "Public reads website content" on public.website_content for select to anon, authenticated using (true);
create policy "Admins manage website content" on public.website_content for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger website_content_updated before update on public.website_content for each row execute function public.set_updated_at();

-- ========== ENQUIRIES ==========
create type public.lead_status as enum ('new','contacted','discussion','proposal_sent','negotiation','converted','lost');

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 255),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 160),
  service_interest text check (service_interest is null or char_length(service_interest) <= 120),
  budget_range text check (budget_range is null or char_length(budget_range) <= 60),
  message text not null check (char_length(message) between 10 and 4000),
  status public.lead_status not null default 'new',
  follow_up_date date,
  internal_notes text,
  ai_summary text,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.enquiries to anon;
grant select, insert, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "Anyone can submit an enquiry" on public.enquiries for insert to anon, authenticated
  with check (status = 'new' and internal_notes is null and follow_up_date is null and ai_summary is null and source = 'website');
create policy "Staff read enquiries" on public.enquiries for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff update enquiries" on public.enquiries for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using (public.is_admin(auth.uid()));
create trigger enquiries_updated before update on public.enquiries for each row execute function public.set_updated_at();
create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_status_idx on public.enquiries (status);

-- ========== NOTIFICATIONS ==========
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid,
  type text not null,
  title text not null,
  body text not null default '',
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Staff read notifications" on public.notifications for select to authenticated
  using (public.is_staff(auth.uid()) and (recipient_id is null or recipient_id = auth.uid()));
create policy "Staff mark notifications" on public.notifications for update to authenticated
  using (public.is_staff(auth.uid()) and (recipient_id is null or recipient_id = auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "Admins delete notifications" on public.notifications for delete to authenticated using (public.is_admin(auth.uid()));
create index notifications_created_idx on public.notifications (created_at desc);

-- ========== ACTIVITY LOGS ==========
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "Staff read activity" on public.activity_logs for select to authenticated using (public.is_staff(auth.uid()));
create index activity_created_idx on public.activity_logs (created_at desc);

-- New enquiry -> admin notification + activity entry
create or replace function public.on_enquiry_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (type, title, body, link)
  values ('enquiry', 'New enquiry from ' || new.name,
          coalesce(new.service_interest, 'General enquiry') || coalesce(' · ' || new.budget_range, ''),
          '/admin/enquiries');
  insert into public.activity_logs (action, entity_type, entity_id, details)
  values ('enquiry.created', 'enquiry', new.id, jsonb_build_object('name', new.name, 'service', new.service_interest));
  return new;
end; $$;
create trigger enquiries_after_insert after insert on public.enquiries for each row execute function public.on_enquiry_created();
