ALTER SCHEMA triggers RENAME TO private;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.clients_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
    if tg_op = 'INSERT' then
        NEW.id := gen_random_uuid();
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

CREATE OR REPLACE FUNCTION private.next_number(_organization_id uuid, _type private.organization_sequences)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$DECLARE
    _sequence text := FORMAT('org_%s_%s_sequence', REPLACE(_organization_id::text, '-', ''), _type::text);
    _next bigint;
BEGIN

    IF NOT EXISTS(SELECT 1 FROM PUBLIC.ORGANIZATIONS O WHERE O.ID = _organization_id) THEN
        RAISE EXCEPTION 'organization (id="%") does not exist or was not accessible', _organization_id;
    END IF;

    EXECUTE FORMAT('CREATE SEQUENCE IF NOT EXISTS private.%I AS BIGINT INCREMENT BY 1 MINVALUE 1 NO MAXVALUE', _sequence);
    EXECUTE FORMAT('SELECT NEXTVAL(''private.%I'')', _sequence) INTO _next;
    RETURN _next;
END;$function$
;

CREATE OR REPLACE FUNCTION private.projects_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
    if tg_op = 'INSERT' then
        NEW.id := gen_random_uuid();
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

CREATE OR REPLACE FUNCTION private.settings_storage_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin

    if tg_op = 'INSERT' then

        IF NEW.type = 'BUILT_IN'::public.settings_storage_type AND EXISTS(SELECT *
                  FROM public.storage_providers sp
                  WHERE sp.type = 'BUILT_IN'::public.settings_storage_type) THEN
            RAISE EXCEPTION 'cannot have more than one BUILT_IN storage provider';
        END IF;

        NEW.is_valid := private.is_valid_storage_settings(
                _type := NEW.type,
                _data := NEW.data
                        );

    elsif tg_op = 'UPDATE' then

        IF OLD.id <> NEW.id THEN
            RAISE EXCEPTION '"id" cannot be changed';
        END IF;

        IF OLD.type <> NEW.type THEN
            RAISE EXCEPTION '"type" cannot be changed';
        END IF;

        NEW.is_valid := private.is_valid_storage_settings(
                _type := NEW.type,
                _data := NEW.data
                        );

    else

        IF OLD.type = 'BUILT_IN'::public.settings_storage_type THEN
            RAISE EXCEPTION 'cannot delete BUILT_IN storage provider';
        END IF;

    end if;


    return coalesce(new, old);

end;$function$
;


