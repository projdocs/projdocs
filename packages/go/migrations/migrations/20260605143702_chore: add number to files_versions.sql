alter table public.files_versions
    add column number bigint not null check ( number > 0 ),
    add constraint files_versions_unique_file_and_number UNIQUE (files_id, number);

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION private.files_versions_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
AS
$function$
begin
    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := 1 + (select count(*) from public.files_versions fv where fv.files_id = new.files_id);
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.created_at := OLD.created_at;
        NEW.files_id := OLD.files_id;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
;

CREATE TRIGGER before_actions
    BEFORE INSERT OR DELETE OR UPDATE
    ON public.files_versions
    FOR EACH ROW
EXECUTE FUNCTION private.files_versions_before_actions();
