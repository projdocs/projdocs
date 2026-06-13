create table public.files
(
    id         uuid primary key         not null default (gen_random_uuid()),
    number     bigint                   not null default 0 check ( number > 0 ), -- only unique per organization
    created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    project_id uuid                     not null references public.projects (id) on update cascade
);

alter table "public"."files"
    enable row level security;

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION private.files_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS
$function$
declare
    project public.projects%rowtype;
begin

    select * from public.projects where id = (coalesce(new.project_id, old.project_id)) limit 1 into project;
    if project.id is null then
        raise exception 'failed to load project';
    end if;

    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := private.next_number(
                _type := 'file'::private.organization_sequences,
                _organization_id := project.organization_id
                  );
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.created_at := OLD.created_at;
        NEW.project_id := OLD.project_id;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
;


CREATE TRIGGER before_actions
    BEFORE INSERT OR DELETE OR UPDATE
    ON public.files
    FOR EACH ROW
EXECUTE FUNCTION private.files_before_actions();