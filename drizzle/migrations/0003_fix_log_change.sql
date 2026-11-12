
create or replace function public.log_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  n jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  o jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  rec jsonb := coalesce(n, o);
  label text := coalesce(rec->>'title', rec->>'name', rec->>'author_name', rec->>'question', rec->>'key', rec->>'role', '');
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
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), tg_table_name || '.' || lower(tg_op), tg_table_name, eid,
          jsonb_build_object('label', label) || extra);
  if tg_op = 'DELETE' then return old; else return new; end if;
end; $$;

create or replace function public.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'super_admin' and (tg_op = 'DELETE' or new.role <> 'super_admin') then
    if (select count(*) from public.user_roles where role = 'super_admin') <= 1 then
      raise exception 'At least one Super Admin must remain';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end; $$;
