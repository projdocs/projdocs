set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_folder_permissions(
    access_level public.permission_levels,
    folder_id uuid
)
    RETURNS boolean
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
    SECURITY DEFINER
AS
$function$
begin
    return private.check_scope_permissions(access_level, null, null, null, folder_id);
end;
$function$
;

REVOKE EXECUTE ON FUNCTION public.check_folder_permissions(public.permission_levels, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_folder_permissions(public.permission_levels, uuid) TO authenticated, admin;

