set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.settings_storage_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
begin

    if tg_op = 'INSERT' then

        IF NEW.type = 'BUILT_IN'::public.settings_storage_type AND EXISTS(SELECT *
                  FROM public.storage_providers sp
                  WHERE sp.type = 'BUILT_IN'::public.settings_storage_type) THEN
            RAISE EXCEPTION 'cannot have more than one BUILT_IN storage provider';
        END IF;

        NEW.is_valid := triggers.is_valid_storage_settings(
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

        NEW.is_valid := triggers.is_valid_storage_settings(
                _type := NEW.type,
                _data := NEW.data
                        );

    else

        IF OLD.type = 'BUILT_IN'::public.settings_storage_type THEN
            RAISE EXCEPTION 'cannot delete BUILT_IN storage provider';
        END IF;

    end if;


    return coalesce(new, old);

end;
$function$
;


