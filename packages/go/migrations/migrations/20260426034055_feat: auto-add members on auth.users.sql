set check_function_bodies = off;
CREATE OR REPLACE FUNCTION triggers.users_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS
$function$
begin
    if tg_op = 'INSERT' then
        WITH organization AS (SELECT *
                              FROM public.organizations
                              WHERE auto_add_members = true)
        INSERT
        INTO public.members (user_id, organization_id, is_admin)
        SELECT NEW.id, organization.id, false
        FROM organization;
    elsif tg_op = 'UPDATE' then
    else -- DELETE
    end if;
    return coalesce(new, old);
end;
$function$
;


CREATE TRIGGER after_actions
    AFTER INSERT OR DELETE OR UPDATE
    ON auth.users
    FOR EACH ROW
EXECUTE FUNCTION triggers.users_after_actions();