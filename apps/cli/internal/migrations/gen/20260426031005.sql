set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.members_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare
    _user       auth.users%rowtype := null;
    _full_name  text               := '';
    _first_name public.person_name := 'New'::public.person_name;
    _last_name  public.person_name := 'User'::public.person_name;
    _avatar_url text := null;
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

        IF _user.raw_user_meta_data IS NOT NULL AND 
            (((_user.raw_user_meta_data -> 'picture') IS NOT NULL
            AND 
            jsonb_typeof(_user.raw_user_meta_data -> 'picture') = 'string') OR ((_user.raw_user_meta_data -> 'avatar_url') IS NOT NULL
            AND 
            jsonb_typeof(_user.raw_user_meta_data -> 'avatar_url') = 'string'))
        THEN
            _avatar_url := COALESCE((_user.raw_user_meta_data ->> 'picture'),(_user.raw_user_meta_data ->> 'avatar_url'));
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Failed to extract name from user metadata: % %', SQLERRM, SQLSTATE;
    END;

    if tg_op = 'INSERT' then
        insert into public.profiles (organization_id,
                                     user_id,
                                     first_name,
                                     last_name,
                                     profile_picture_url)
        values (NEW.organization_id,
                NEW.user_id,
                _first_name,
                _last_name,
                _avatar_url::text);
    elsif tg_op = 'DELETE' then
        delete from public.profiles p where p.organization_id = old.organization_id and p.user_id = old.user_id;
    end if;

    return coalesce(new, old);

end;$function$
;


