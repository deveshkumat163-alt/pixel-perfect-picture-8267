
-- ========== HELPERS ==========
create or replace function public.can_manage_projects(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('super_admin','admin','project_manager'))
$$;

create type public.project_status as enum ('new','planning','in_progress','review','completed','on_hold');
create type public.task_status as enum ('todo','in_progress','review','done');
create type public.task_priority as enum ('low','medium','high','urgent');
create type public.invoice_status as enum ('draft','sent','void');
create type public.payment_status as enum ('pending','confirmed','failed','refunded');

-- ========== CLIENTS ==========
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  company text check (company is null or char_length(company) <= 160),
  email text check (email is null or char_length(email) <= 255),
  phone text check (phone is null or char_length(phone) <= 40),
  address text check (address is null or char_length(address) <= 500),
  tax_id text check (tax_id is null or char_length(tax_id) <= 60),
  website text check (website is null or char_length(website) <= 255),
  notes text check (notes is null or char_length(notes) <= 5000),
  is_active boolean not null default true,
  source_enquiry_id uuid references public.enquiries(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create policy "Staff read clients" on public.clients for select to authenticated using (public.is_staff(auth.uid()));
create policy "Managers add clients" on public.clients for insert to authenticated with check (public.can_manage_projects(auth.uid()));
create policy "Managers edit clients" on public.clients for update to authenticated using (public.can_manage_projects(auth.uid())) with check (public.can_manage_projects(auth.uid()));
create policy "Admins delete clients" on public.clients for delete to authenticated using (public.is_admin(auth.uid()));
create trigger clients_updated before update on public.clients for each row execute function public.set_updated_at();
create index clients_email_idx on public.clients (lower(email));

-- ========== PROJECTS (internal) ==========
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  client_id uuid references public.clients(id) on delete set null,
  status public.project_status not null default 'new',
  service text check (service is null or char_length(service) <= 120),
  description text not null default '' check (char_length(description) <= 10000),
  start_date date,
  due_date date,
  budget numeric(12,2) check (budget is null or budget >= 0),
  currency text not null default 'INR' check (char_length(currency) = 3),
  progress int not null default 0 check (progress between 0 and 100),
  manager_id uuid references public.profiles(id) on delete set null,
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 10000),
  source_enquiry_id uuid references public.enquiries(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "Staff read projects" on public.projects for select to authenticated using (public.is_staff(auth.uid()));
create policy "Managers add projects" on public.projects for insert to authenticated with check (public.can_manage_projects(auth.uid()));
create policy "Managers edit projects" on public.projects for update to authenticated using (public.can_manage_projects(auth.uid())) with check (public.can_manage_projects(auth.uid()));
create policy "Admins delete projects" on public.projects for delete to authenticated using (public.is_admin(auth.uid()));
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create index projects_client_idx on public.projects (client_id);
create index projects_status_idx on public.projects (status);

-- ========== TASKS ==========
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "Staff read tasks" on public.tasks for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff add tasks" on public.tasks for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "Managers, assignees and creators edit tasks" on public.tasks for update to authenticated
  using (public.can_manage_projects(auth.uid()) or assignee_id = auth.uid() or created_by = auth.uid())
  with check (public.is_staff(auth.uid()));
create policy "Managers and creators delete tasks" on public.tasks for delete to authenticated
  using (public.can_manage_projects(auth.uid()) or created_by = auth.uid());
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create index tasks_project_idx on public.tasks (project_id);
create index tasks_assignee_idx on public.tasks (assignee_id);

create or replace function public.tasks_before_write()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end; $$;
create trigger tasks_completed before insert or update on public.tasks for each row execute function public.tasks_before_write();

create or replace function public.notify_task_assignee()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id is not null
     and new.assignee_id is distinct from auth.uid()
     and (tg_op = 'INSERT' or old.assignee_id is distinct from new.assignee_id) then
    insert into public.notifications (recipient_id, type, title, body, link)
    values (new.assignee_id, 'task', 'New task assigned: ' || new.title,
            coalesce('Due ' || to_char(new.due_date, 'DD Mon YYYY'), 'No due date'), '/admin/tasks');
  end if;
  return new;
end; $$;
create trigger tasks_notify after insert or update on public.tasks for each row execute function public.notify_task_assignee();

-- ========== INVOICES ==========
create sequence public.invoice_number_seq;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'INR' check (char_length(currency) = 3),
  tax_rate numeric(5,2) not null default 0 check (tax_rate between 0 and 100),
  tax_label text not null default 'Tax' check (char_length(tax_label) <= 30),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  notes text check (notes is null or char_length(notes) <= 5000),
  terms text check (terms is null or char_length(terms) <= 5000),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;
create policy "Admins manage invoices" on public.invoices for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger invoices_updated before update on public.invoices for each row execute function public.set_updated_at();
create index invoices_client_idx on public.invoices (client_id);

create or replace function public.assign_invoice_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'INV-' || to_char(new.issue_date, 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0');
  end if;
  return new;
end; $$;
create trigger invoices_number before insert on public.invoices for each row execute function public.assign_invoice_number();

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null check (char_length(description) between 1 and 500),
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.invoice_items to authenticated;
grant all on public.invoice_items to service_role;
alter table public.invoice_items enable row level security;
create policy "Admins manage invoice items" on public.invoice_items for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

-- ========== PAYMENTS ==========
create sequence public.receipt_number_seq;
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  paid_on date not null default current_date,
  method text not null default 'bank_transfer' check (method in ('bank_transfer','upi','card','cash','cheque','other')),
  reference text check (reference is null or char_length(reference) <= 120),
  status public.payment_status not null default 'pending',
  receipt_number text unique,
  notes text check (notes is null or char_length(notes) <= 2000),
  recorded_by uuid default auth.uid(),
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "Admins manage payments" on public.payments for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger payments_updated before update on public.payments for each row execute function public.set_updated_at();
create index payments_invoice_idx on public.payments (invoice_id);

-- Invoice total, computed the same way as the app: discount before tax.
create or replace function public.invoice_total(_invoice_id uuid)
returns numeric language sql stable security definer set search_path = public as $$
  select round(greatest(coalesce(sum(ii.quantity * ii.unit_price), 0) - i.discount, 0) * (1 + i.tax_rate / 100), 2)
  from public.invoices i
  left join public.invoice_items ii on ii.invoice_id = i.id
  where i.id = _invoice_id
  group by i.id, i.discount, i.tax_rate
$$;

-- Confirmed payments get a receipt number and verifier; they can never exceed the invoice total.
create or replace function public.payments_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  confirmed_other numeric;
  inv_status public.invoice_status;
begin
  if new.status = 'confirmed' then
    select status into inv_status from public.invoices where id = new.invoice_id;
    if inv_status = 'void' then
      raise exception 'Cannot confirm a payment on a void invoice';
    end if;
    select coalesce(sum(amount), 0) into confirmed_other from public.payments
      where invoice_id = new.invoice_id and status = 'confirmed' and id <> new.id;
    if confirmed_other + new.amount > public.invoice_total(new.invoice_id) then
      raise exception 'Confirmed payments would exceed the invoice total';
    end if;
    if new.receipt_number is null then
      new.receipt_number := 'RCT-' || to_char(new.paid_on, 'YYYY') || '-' || lpad(nextval('public.receipt_number_seq')::text, 4, '0');
    end if;
    if tg_op = 'INSERT' or old.status <> 'confirmed' then
      new.verified_by := auth.uid();
      new.verified_at := now();
    end if;
  end if;
  return new;
end; $$;
create trigger payments_validate before insert or update on public.payments for each row execute function public.payments_before_write();

-- ========== PRIVATE SETTINGS ==========
create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "Staff read settings" on public.app_settings for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins manage settings" on public.app_settings for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger app_settings_updated before update on public.app_settings for each row execute function public.set_updated_at();

-- ========== ENQUIRY CONVERSION ==========
create or replace function public.convert_enquiry(_enquiry_id uuid, _create_project boolean default true)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  e public.enquiries;
  cid uuid;
  pid uuid;
begin
  if not public.can_manage_projects(auth.uid()) then
    raise exception 'Only Admins and Project Managers can convert enquiries';
  end if;
  select * into e from public.enquiries where id = _enquiry_id;
  if not found then raise exception 'Enquiry not found'; end if;
  select id into cid from public.clients where lower(email) = lower(e.email) limit 1;
  if cid is null then
    insert into public.clients (name, company, email, phone, source_enquiry_id, created_by)
    values (e.name, e.company, lower(e.email), e.phone, e.id, auth.uid())
    returning id into cid;
  end if;
  if _create_project then
    insert into public.projects (name, client_id, service, description, source_enquiry_id, created_by)
    values (left(coalesce(e.service_interest, 'New project') || ' for ' || coalesce(nullif(e.company, ''), e.name), 200),
            cid, e.service_interest, e.message, e.id, auth.uid())
    returning id into pid;
  end if;
  update public.enquiries set status = 'converted' where id = e.id;
  return jsonb_build_object('client_id', cid, 'project_id', pid);
end; $$;
grant execute on function public.convert_enquiry(uuid, boolean) to authenticated;

-- ========== AUDIT ==========
create or replace function public.log_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  n jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  o jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  rec jsonb := coalesce(n, o);
  label text := coalesce(rec->>'title', rec->>'name', rec->>'author_name', rec->>'question',
                         rec->>'invoice_number', rec->>'receipt_number', rec->>'key', rec->>'role', '');
  eid uuid;
  extra jsonb := '{}'::jsonb;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  begin eid := (rec->>'id')::uuid; exception when others then eid := null; end;
  if tg_op = 'UPDATE' and (o->>'status') is distinct from (n->>'status') then
    extra := jsonb_build_object('status', n->>'status');
  end if;
  if tg_table_name = 'payments' then
    extra := extra || jsonb_build_object('amount', rec->>'amount');
  end if;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), tg_table_name || '.' || lower(tg_op), tg_table_name, eid,
          jsonb_build_object('label', label) || extra);
  if tg_op = 'DELETE' then return old; else return new; end if;
end; $$;

create trigger clients_audit after insert or update or delete on public.clients for each row execute function public.log_change();
create trigger projects_audit after insert or update or delete on public.projects for each row execute function public.log_change();
create trigger tasks_audit after insert or delete on public.tasks for each row execute function public.log_change();
create trigger invoices_audit after insert or update or delete on public.invoices for each row execute function public.log_change();
create trigger payments_audit after insert or update or delete on public.payments for each row execute function public.log_change();
create trigger app_settings_audit after insert or update on public.app_settings for each row execute function public.log_change();

-- Staff can upload their own avatar into media/avatars
create policy "Staff upload avatars" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and public.is_staff(auth.uid()));
