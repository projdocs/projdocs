alter table public.files_versions
    add column last_modified_by uuid not null default null references public.profiles (id) on update cascade;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.files_versions_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
    SECURITY DEFINER
AS
$function$
begin
    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := 1 + coalesce(
                (select number
                 from public.files_versions
                 where files_id = new.files_id
                 order by created_at desc
                 limit 1),
                0);
        NEW.last_modified_by := (select p.id from public.profiles p where p.user_id = auth.uid() and p.organization_id = private.get_folder_organization_id(_folder_id := (select f.folder_id from public.files f where f.id = NEW.files_id)));
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.created_at := OLD.created_at;
        NEW.files_id := OLD.files_id;
        NEW.last_modified_by := (select p.id from public.profiles p where p.user_id = auth.uid() and p.organization_id = private.get_folder_organization_id(_folder_id := (select f.folder_id from public.files f where f.id = NEW.files_id)));
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
;

CREATE OR REPLACE FUNCTION private.profiles_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
begin
    if tg_op = 'INSERT' then
        -- insert
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.organization_id := OLD.organization_id;
        NEW.user_id := OLD.user_id;
    else -- DELETE

        -- set last_modified to ghost
        update public.files_versions
        set last_modified_by = (select p.id from public.profiles p where p.user_id = '095E3B93-603F-46E0-A6CE-C200F1BE1995'::uuid and p.organization_id = old.organization_id)
        where last_modified_by = OLD.id;
    end if;
    return coalesce(new, old);
end;
$function$
;

