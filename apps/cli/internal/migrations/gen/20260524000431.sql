
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.clients_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := private.next_number(
                _type := 'client'::private.organization_sequences,
                _organization_id := NEW.organization_id
                      );
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.organization_id := OLD.organization_id;
        NEW.created_at := OLD.created_at;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;$function$
;

CREATE OR REPLACE FUNCTION private.projects_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := private.next_number(
                _type := 'project'::private.organization_sequences,
                _organization_id := NEW.organization_id
                      );
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.organization_id := OLD.organization_id;
        NEW.created_at := OLD.created_at;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;$function$
;


