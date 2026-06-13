set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.settings_storage_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin

    if tg_op = 'INSERT' then

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

    else -- DELETE

    end if;


    return coalesce(new, old);

end;$function$
;


