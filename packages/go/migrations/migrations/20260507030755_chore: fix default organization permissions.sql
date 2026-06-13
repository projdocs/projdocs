alter table public.organizations
    drop column auto_add_members;

alter table public.organizations
    add column default_permissions_id uuid not null;

alter table "public"."organizations"
    add constraint "organizations_default_permissions_id_fkey" FOREIGN KEY (default_permissions_id) REFERENCES public.permissions (id) ON UPDATE CASCADE ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED not valid;

alter table "public"."organizations"
    validate constraint "organizations_default_permissions_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.users_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
    organization public.organizations%rowtype;
begin
    if tg_op = 'INSERT' then
        for organization in select * from public.organizations where organizations.default_permissions_id is not null
            loop
                insert into public.members (user_id, permissions_id)
                values (NEW.id, organization.default_permissions_id);
            end loop;
    elsif tg_op = 'UPDATE' then
    else -- DELETE
    end if;
    return coalesce(new, old);
end;
$function$
;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.organizations_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
    SECURITY DEFINER
AS
$$
declare
    _no_op_id uuid := gen_random_uuid();
begin
    if tg_op = 'INSERT' then
        -- create admin role
        INSERT INTO public.permissions (display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES ('Administrator',
                'DELETE'::public.permission_levels,
                'DELETE'::public.permission_levels,
                'DELETE'::public.permission_levels,
                NEW.id,
                true);

        -- create view-only role
        INSERT INTO public.permissions (display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES ('View-Only',
                'VIEW'::public.permission_levels,
                'VIEW'::public.permission_levels,
                'VIEW'::public.permission_levels,
                NEW.id,
                true);

        -- create no-op role
        INSERT INTO public.permissions (id,
                                        display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES (_no_op_id,
                'None',
                'NONE'::public.permission_levels,
                'NONE'::public.permission_levels,
                'NONE'::public.permission_levels,
                NEW.id,
                true);
        NEW.default_permissions_id := _no_op_id;
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
    end if;

    return coalesce(new, old);
end;
$$;


create trigger before_actions
    BEFORE INSERT OR DELETE OR UPDATE
    on public.organizations
    for each row
execute function private.organizations_before_actions();

CREATE OR REPLACE FUNCTION private.organizations_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
    SECURITY DEFINER
AS
$function$
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

    RETURN coalesce(new, old);
END;
$function$
;

CREATE OR REPLACE FUNCTION private.members_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
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
        delete from public.profiles p where p.organization_id = old.organization_id and p.user_id = old.user_id;
    end if;

    return coalesce(new, old);

end;
$function$
;
