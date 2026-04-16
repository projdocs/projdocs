set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.members_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
AS
$function$
declare
    _user       auth.users%rowtype := null;
    _full_name  text := '';
    _first_name person_name        := 'New'::person_name;
    _last_name  person_name        := 'User'::person_name;
begin

    SELECT *
    INTO _user
    FROM auth.users u
    WHERE u.id = COALESCE(old.user_id, new.user_id)
    LIMIT 1;

    BEGIN
        IF _user.raw_user_meta_data IS NOT NULL
            AND (_user.raw_user_meta_data -> 'full_name') IS NOT NULL
            AND jsonb_typeof(_user.raw_user_meta_data -> 'full_name') = 'string'
        THEN
            _full_name := trim(_user.raw_user_meta_data ->> 'full_name');
            _first_name := split_part(_full_name, ' ', 1);
            _last_name := NULLIF(split_part(_full_name, ' ', 2), '');
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Failed to extract name from user metadata: % %', SQLERRM, SQLSTATE;
    END;

    if tg_op = 'INSERT' then
        insert into public.profiles (organization_id,
                                     user_id,
                                     first_name,
                                     last_name)
        values (NEW.organization_id,
                NEW.user_id,
                _first_name,
                _last_name);
    end if;

    return coalesce(old, new);

end;
$function$
;


CREATE TRIGGER after_actions
    AFTER INSERT OR DELETE OR UPDATE
    ON public.members
    FOR EACH ROW
EXECUTE FUNCTION triggers.members_after_actions();


