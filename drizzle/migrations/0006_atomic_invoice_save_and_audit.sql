CREATE OR REPLACE FUNCTION public.save_invoice(_invoice jsonb, _items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE iid uuid; item jsonb;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Only admins can manage invoices'; END IF;
 IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'Add at least one invoice item'; END IF;
 iid := nullif(_invoice->>'id','')::uuid;
 IF iid IS NOT NULL THEN
  PERFORM 1 FROM public.invoices WHERE id = iid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF EXISTS(SELECT 1 FROM public.payments WHERE invoice_id = iid) THEN RAISE EXCEPTION 'Invoices with payments cannot be edited'; END IF;
  UPDATE public.invoices SET client_id = (_invoice->>'client_id')::uuid, project_id = nullif(_invoice->>'project_id','')::uuid,
   status = (_invoice->>'status')::public.invoice_status, issue_date = (_invoice->>'issue_date')::date, due_date = nullif(_invoice->>'due_date','')::date,
   currency = _invoice->>'currency', tax_rate = (_invoice->>'tax_rate')::numeric, tax_label = _invoice->>'tax_label', discount = (_invoice->>'discount')::numeric,
   notes = _invoice->>'notes', terms = _invoice->>'terms' WHERE id = iid;
  DELETE FROM public.invoice_items WHERE invoice_id = iid;
 ELSE
  INSERT INTO public.invoices(client_id, project_id, status, issue_date, due_date, currency, tax_rate, tax_label, discount, notes, terms)
  VALUES((_invoice->>'client_id')::uuid, nullif(_invoice->>'project_id','')::uuid, (_invoice->>'status')::public.invoice_status,
   (_invoice->>'issue_date')::date, nullif(_invoice->>'due_date','')::date, _invoice->>'currency', (_invoice->>'tax_rate')::numeric,
   _invoice->>'tax_label', (_invoice->>'discount')::numeric, _invoice->>'notes', _invoice->>'terms') RETURNING id INTO iid;
 END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(_items) LOOP
  INSERT INTO public.invoice_items(invoice_id, description, quantity, unit_price, sort_order)
  VALUES(iid, item->>'description', (item->>'quantity')::numeric, (item->>'unit_price')::numeric, coalesce((item->>'sort_order')::integer,0));
 END LOOP;
 RETURN iid;
END; $$;
REVOKE ALL ON FUNCTION public.save_invoice(jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_invoice(jsonb,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.payments_before_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE confirmed_other numeric; inv_status public.invoice_status;
BEGIN
 SELECT status INTO inv_status FROM public.invoices WHERE id = new.invoice_id FOR UPDATE;
 IF new.status = 'confirmed' THEN
  IF inv_status = 'void' THEN RAISE EXCEPTION 'Cannot confirm a payment on a void invoice'; END IF;
  SELECT coalesce(sum(amount),0) INTO confirmed_other FROM public.payments WHERE invoice_id = new.invoice_id AND status = 'confirmed' AND id <> new.id;
  IF confirmed_other + new.amount > public.invoice_total(new.invoice_id) THEN RAISE EXCEPTION 'Confirmed payments would exceed the invoice total'; END IF;
  IF new.receipt_number IS NULL THEN new.receipt_number := 'RCT-' || to_char(new.paid_on,'YYYY') || '-' || lpad(nextval('public.receipt_number_seq')::text,4,'0'); END IF;
  IF tg_op = 'INSERT' OR old.status <> 'confirmed' THEN new.verified_by := auth.uid(); new.verified_at := now(); END IF;
 END IF;
 RETURN new;
END; $$;
CREATE TRIGGER tasks_update_audit AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_change();
CREATE TRIGGER profiles_update_audit AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_change();