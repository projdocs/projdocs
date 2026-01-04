alter table "public"."users" drop constraint "users_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

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
    WHEN 'DELETE' THEN
      IF OLD.id = auth.uid() THEN
        RAISE EXCEPTION 'cannot delete own user';
      END IF;
  END CASE;
  RETURN COALESCE (NEW, OLD);
END;$function$
;


