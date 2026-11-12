
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  title text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Staff read all profiles" on public.profiles for select to authenticated using (public.is_staff(auth.uid()));
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- New user: create profile; the very first user becomes super admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  if not exists (select 1 from public.user_roles where role = 'super_admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Never allow removing the last super admin
create or replace function public.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'super_admin' and (tg_op = 'DELETE' or new.role <> 'super_admin') then
    if (select count(*) from public.user_roles where role = 'super_admin') <= 1 then
      raise exception 'At least one Super Admin must remain';
    end if;
  end if;
  return coalesce(new, old);
end; $$;
create trigger user_roles_protect before update or delete on public.user_roles for each row execute function public.protect_last_super_admin();

-- Audit log for content + CRM changes
create or replace function public.log_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  label text := coalesce(rec->>'title', rec->>'name', rec->>'author_name', rec->>'question', rec->>'key', '');
  eid uuid;
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  begin eid := (rec->>'id')::uuid; exception when others then eid := null; end;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), tg_table_name || '.' || lower(tg_op), tg_table_name, eid,
          jsonb_build_object('label', label)
          || case when tg_table_name = 'enquiries' and tg_op = 'UPDATE' and old.status is distinct from new.status
                  then jsonb_build_object('status', new.status) else '{}'::jsonb end);
  return coalesce(new, old);
end; $$;

create trigger services_audit after insert or update or delete on public.services for each row execute function public.log_change();
create trigger portfolio_audit after insert or update or delete on public.portfolio_items for each row execute function public.log_change();
create trigger testimonials_audit after insert or update or delete on public.testimonials for each row execute function public.log_change();
create trigger faqs_audit after insert or update or delete on public.faqs for each row execute function public.log_change();
create trigger website_content_audit after insert or update or delete on public.website_content for each row execute function public.log_change();
create trigger enquiries_audit after update or delete on public.enquiries for each row execute function public.log_change();
create trigger user_roles_audit after insert or delete on public.user_roles for each row execute function public.log_change();

-- Media bucket access (bucket itself is private; public reads go through the app's media route)
create policy "Public read media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "Admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin(auth.uid()));
create policy "Admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin(auth.uid()));
create policy "Admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin(auth.uid()));
