create table "public"."projects"
(
    "id"              uuid                     not null default gen_random_uuid() primary key,
    "created_at"      timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "number"          bigint                   not null default 0,
    "organization_id" uuid                     not null REFERENCES public.organizations (id) on update cascade on delete cascade,
    unique (id, organization_id)
);


alter table "public"."projects"
    enable row level security;

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION triggers.projects_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS
$function$
begin
    if tg_op = 'INSERT' then
        NEW.id := gen_random_uuid();
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := triggers.next_number(
                _type := 'project'::triggers.organization_sequences,
                _organization_id := NEW.organization_id
                      );
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.organization_id := OLD.organization_id;
        NEW.created_at := OLD.created_at;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
;


CREATE TRIGGER before_actions
    BEFORE INSERT OR DELETE OR UPDATE
    ON public.projects
    FOR EACH ROW
EXECUTE FUNCTION triggers.projects_before_actions();