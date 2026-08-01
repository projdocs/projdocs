alter table "public"."files_versions" add column "modified_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text);

CREATE OR REPLACE FUNCTION private.files_versions_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS $function$
begin
    if tg_op = 'INSERT' then
        NEW.created_at := (now() AT TIME ZONE 'utc'::text);
        NEW.modified_at := (now() AT TIME ZONE 'utc'::text);
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
        NEW.modified_at := (now() AT TIME ZONE 'utc'::text);
        NEW.files_id := OLD.files_id;
        NEW.last_modified_by := (select p.id from public.profiles p where p.user_id = auth.uid() and p.organization_id = private.get_folder_organization_id(_folder_id := (select f.folder_id from public.files f where f.id = NEW.files_id)));
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
