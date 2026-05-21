alter table public.files
    rename column folders_id to folder_id;

create policy "select" on public.files
    as permissive for select to authenticated
    using ((select exists(select f.id from public.folders f where f.id = folder_id) as can_view_folder));

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.files_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
    folder       public.folders%rowtype;
    organization public.organizations%rowtype;
begin

    select f.* from public.folders f where f.id = (coalesce(new.folder_id, old.folder_id)) limit 1 into folder;
    if folder.id is null then
        raise exception 'failed to load folder';
    end if;

    case
        when folder.organization_id is not null
            then (select * from public.organizations o where o.id = folder.organization_id into organization);
        when folder.project_id is not null then (select *
                                                 from public.organizations o
                                                 where o.id = (select p.organization_id
                                                               from public.projects p
                                                               where p.id = folder.project_id)
                                                 into organization);
        when folder.client_id is not null then (select *
                                                from public.organizations o
                                                where o.id = (select c.organization_id
                                                              from public.clients c
                                                              where c.id = folder.client_id)
                                                into organization);
        when folder.member_id is not null then (select *
                                                from public.organizations o
                                                where o.id = (select p.organization_id
                                                              from public.permissions p
                                                                       join public.members m on m.permissions_id = p.id and m.id = folder.member_id)
                                                into organization);
        end case;

    if organization.id is null then
        raise exception 'failed to load organization';
    end if;

    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := private.next_number(
                _type := 'file'::private.organization_sequences,
                _organization_id := organization.id
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

