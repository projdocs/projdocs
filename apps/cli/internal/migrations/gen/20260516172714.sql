
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.profiles_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin

  if tg_op = 'DELETE' then
    if (
      0 < (
        select count(*)
        from public.members member
        where member.permissions_id in (
          select id from public.permissions where organization_id = OLD.organization_id
        )
        and member.user_id = OLD.user_id
      )
    ) then
      raise exception 'cannot delete a profile before deleting its corresponding row in `members`';
    end if;

  end if;

  return coalesce(new, old);

end;$function$
;

CREATE OR REPLACE FUNCTION private.members_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare
    _user       auth.users%rowtype := null;
    _full_name  text               := '';
    _first_name public.person_name := 'New'::public.person_name;
    _last_name  public.person_name := 'User'::public.person_name;
    _avatar_url text               := null;
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
             jsonb_typeof(_user.raw_user_meta_data -> 'picture') = 'string') OR
            ((_user.raw_user_meta_data -> 'avatar_url') IS NOT NULL
                AND
             jsonb_typeof(_user.raw_user_meta_data -> 'avatar_url') = 'string'))
        THEN
            _avatar_url :=
                    COALESCE((_user.raw_user_meta_data ->> 'picture'), (_user.raw_user_meta_data ->> 'avatar_url'));
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Failed to extract name from user metadata: % %', SQLERRM, SQLSTATE;
    END;

    if tg_op = 'INSERT' then
        INSERT INTO public.profiles (organization_id,
                                     user_id,
                                     first_name,
                                     last_name,
                                     profile_picture_url)
        SELECT p.organization_id,
               NEW.user_id,
               _first_name,
               _last_name,
               _avatar_url::text
        FROM public.permissions p
        WHERE p.id = NEW.permissions_id;
    elsif tg_op = 'DELETE' then
        delete from public.profiles p where p.organization_id in (select perms.organization_id from public.permissions perms where perms.id = OLD.permissions_id) and p.user_id = old.user_id;
    end if;

    return coalesce(new, old);

end;$function$
;

CREATE OR REPLACE FUNCTION private.profiles_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
  return coalesce(new, old);
end;$function$
;

CREATE TRIGGER after_actions AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.profiles_after_actions();


