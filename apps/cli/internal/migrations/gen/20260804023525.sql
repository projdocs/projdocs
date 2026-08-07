alter table "public"."files"
    add column "modified_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text);

CREATE OR REPLACE FUNCTION private.files_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
declare
    folder         public.folders%rowtype;
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
        NEW.modified_at := (now() AT TIME ZONE 'utc'::text);
        NEW.number := private.next_number(
                _type := 'file'::private.organization_sequences,
                _organization_id := organizationID
                      );
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
        NEW.number := OLD.number;
        NEW.created_at := OLD.created_at;
        NEW.modified_at := (now() AT TIME ZONE 'utc'::text);
        NEW.folder_id := OLD.folder_id;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
