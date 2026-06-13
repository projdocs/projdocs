set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.get_folder_organization_id(_folder_id uuid)
    RETURNS uuid
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
    SECURITY INVOKER
AS
$function$
declare
    folder         public.folders%rowtype;
    organizationID uuid;
begin

    select f.* from public.folders f where f.id = _folder_id limit 1 into folder;
    if folder.id is null then
        raise exception 'unable to load folder "%"', _folder_id;
    end if;

    organizationID := case
                          when folder.organization_id is not null then folder.organization_id
                          when folder.project_id is not null then (select p.organization_id
                                                                   from public.projects p
                                                                   where p.id = folder.project_id
                                                                   limit 1)
                          when folder.client_id is not null then (select c.organization_id
                                                                  from public.clients c
                                                                  where c.id = folder.client_id
                                                                  limit 1)
                          when folder.folder_id is not null
                              then (select private.get_folder_organization_id(folder.folder_id))
        end;

    if organizationID is null then
        raise exception 'unable to load organization ID';
    end if;

    return organizationID;

end;
$function$
;


CREATE OR REPLACE FUNCTION private.files_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
    folder       public.folders%rowtype;
    organizationID uuid := null;
begin

    select f.* from public.folders f where f.id = (coalesce(new.folder_id, old.folder_id)) limit 1 into folder;
    if folder.id is null then
        raise exception 'failed to load folder';
    end if;

    organizationID := private.get_folder_organization_id(folder.id);
    if organizationID is null then
        raise exception 'failed to load organization id';
    end if;

    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := private.next_number(
                _type := 'file'::private.organization_sequences,
                _organization_id := organizationID
                      );
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.created_at := OLD.created_at;
        NEW.folder_id := OLD.folder_id;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
;


