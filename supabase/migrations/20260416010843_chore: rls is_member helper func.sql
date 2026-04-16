set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_member(org_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY definer
AS
$function$
begin
    return (select (
                       1 = (select count(*)
                            from public.members m
                            where m.user_id = (select auth.uid()) and m.organization_id = org_id)
                       ));
end;
$function$
;


