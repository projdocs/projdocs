set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.company_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN

  if tg_op = 'INSERT' THEN
    insert into storage.buckets (id, name, public) values
    ('company-public', 'company-public', true);

    insert into storage.buckets (id, name, public) values
    ('company-private', 'company-private', false);
  end if;

  return coalesce(new, old);

END;$function$
;

CREATE TRIGGER company_after_actions AFTER INSERT OR DELETE OR UPDATE ON public.company FOR EACH ROW EXECUTE FUNCTION triggers.company_after_actions();


