set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.users_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  CASE TG_OP
    WHEN 'INSERT' THEN
      NEW.is_suspended := FALSE;
    WHEN 'UPDATE' THEN
      IF NEW.is_suspended IS TRUE AND NEW.is_suspended IS DISTINCT FROM OLD.is_suspended AND NEW.id = auth.uid() THEN
        RAISE EXCEPTION 'cannot suspend own user';
      END IF;
  END CASE;
END;$function$
;

CREATE TRIGGER users_before_actions BEFORE INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION triggers.users_before_actions();


