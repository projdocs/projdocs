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
                          when folder.member_id is not null then (select p.organization_id
                                                                  from public.permissions p
                                                                  where p.id = (select m.permissions_id
                                                                                from public.members m
                                                                                where m.id = folder.member_id
                                                                                limit 1)
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


