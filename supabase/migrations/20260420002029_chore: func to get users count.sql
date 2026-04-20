set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET SEARCH_PATH = ''
AS $function$BEGIN

  IF current_setting('request.jwt.claims', true)::jsonb->>'role' <> 'service_role' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN (SELECT COUNT(*) FROM AUTH.USERS);

END;$function$
;


