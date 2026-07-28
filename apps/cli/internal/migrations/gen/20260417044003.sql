set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.settings_storage_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS
$function$
begin

    if tg_op = 'INSERT' then

        NEW.is_valid := triggers.is_valid_storage_settings(
                _type := NEW.type,
                _data := NEW.data
                        );

    elsif tg_op = 'UPDATE' then

        NEW.is_valid := triggers.is_valid_storage_settings(
                _type := NEW.type,
                _data := NEW.data
                        );

    else -- DELETE

    end if;


    return coalesce(new, old);

end;
$function$
;


CREATE TRIGGER before_actions
    BEFORE INSERT OR DELETE OR UPDATE
    ON public.settings_storage
    FOR EACH ROW
EXECUTE FUNCTION triggers.settings_storage_before_actions();