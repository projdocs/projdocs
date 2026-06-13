alter table "public"."members"
    drop constraint "members_organization_id_fkey";

alter table "public"."members"
    drop constraint "members_user_id_organization_id_key";

drop index if exists "public"."members_user_id_organization_id_key";

alter table "public"."members"
    drop column "organization_id";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.is_member(org_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
begin
    RETURN EXISTS (SELECT 1
                   FROM public.members m
                            INNER JOIN public.permissions p ON p.id = m.permissions_id
                   WHERE m.user_id = (SELECT auth.uid())
                     AND p.organization_id = org_id);
end;
$function$
;
