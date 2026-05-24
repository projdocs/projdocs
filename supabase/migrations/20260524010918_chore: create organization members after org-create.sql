set check_function_bodies = off;
CREATE OR REPLACE FUNCTION private.organizations_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
    _user auth.users%rowtype;
begin

    -- permissions must belong to this organization
    if tg_op <> 'DELETE' then
        IF NOT EXISTS (SELECT 1
                       FROM public.permissions p
                       WHERE p.organization_id = NEW.id
                         AND p.id = NEW.default_permissions_id) THEN
            raise exception 'permission (id="%") does not belong to organization(id="%")', NEW.default_permissions_id, NEW.id;
        END IF;
    end if;

    if tg_op = 'INSERT' then

        -- create the deleted/ghost user
        insert into public.profiles (user_id,
                                     organization_id,
                                     first_name,
                                     last_name)
        values ('095E3B93-603F-46E0-A6CE-C200F1BE1995'::uuid,
                NEW.id,
                'Deleted',
                'User');

        -- create member rows (except for ghost or admin)
        for _user in select *
                     from auth.users
                     where email not in ('admin@projdocs.localhost', 'ghost@projdocs.localhost')
            loop
                insert into public.members (user_id, permissions_id)
                values (_user.id, NEW.default_permissions_id);
            end loop;
    end if;

    RETURN coalesce(new, old);
END;
$function$
;


