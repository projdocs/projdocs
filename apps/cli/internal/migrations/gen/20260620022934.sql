set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.organizations_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
    _no_op_id uuid := gen_random_uuid();
begin
    if tg_op = 'INSERT' then

        -- create default storage if not exists
        INSERT INTO storage.buckets ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection",
                                     "file_size_limit", "allowed_mime_types", "owner_id", "type")
        VALUES ('projdocs', 'projdocs', null, current_timestamp, current_timestamp, false, false,
                null, null, null, 'STANDARD')
        ON CONFLICT (id) DO NOTHING;

        -- use default
        IF NEW.storage_providers_id IS NULL THEN
            NEW.storage_providers_id := (select id
                                         from public.storage_providers
                                         where type = 'BUILT_IN'::public.settings_storage_type
                                         limit 1);
        END IF;

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

        -- create editor role
        INSERT INTO public.permissions (display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES ('Editor',
                'EDIT'::public.permission_levels,
                'EDIT'::public.permission_levels,
                'EDIT'::public.permission_levels,
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
$function$
;