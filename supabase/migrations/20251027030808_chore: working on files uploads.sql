set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers."storage.objects_after_actions"()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  _id uuid := gen_random_uuid();
  _name text := gen_random_uuid();
begin

  SET CONSTRAINTS versions_object_id_fkey DEFERRED;

  if (tg_op = 'INSERT' OR tg_op = 'UPDATE') then

    if (new.user_metadata ->> 'filename') IS NOT NULL then
      _name := (new.user_metadata ->> 'filename')::text;
    end if;

    if ((new.user_metadata ->> 'directory_id') IS NOT NULL AND
       EXISTS (
         SELECT 1 FROM public.directories
         WHERE id = (new.user_metadata ->> 'directory_id')::uuid
       ))
  AND (
    (new.user_metadata -> 'file_id') = 'null' OR
    ((new.user_metadata ->> 'file_id') ~* '^[0-9a-f-]{36}$' AND
     EXISTS (
       SELECT 1 FROM public.files
       WHERE id = (new.user_metadata ->> 'file_id')::uuid
     ))
  ) then

      if (new.user_metadata -> 'file_id') = 'null' then
      
        -- create file
        insert into public.files (id) values (_id);

        -- create version
        insert into public.files_versions (object_id, file_id, version, name) values (new.id, _id, 0, _name);
        
        -- create symlink
        insert into public.symlinks (directory_id, file_id, name) values ((new.user_metadata ->> 'directory_id')::uuid, _id, _name);
      else

        -- create version
        insert into public.files_versions (object_id, file_id, version, name) values (new.id, (new.user_metadata ->> 'file_id')::uuid, 0, _name);

         -- create symlink
        if not exists (
          select 1 from public.symlinks where 
            directory_id = (new.user_metadata ->> 'directory_id')::uuid 
            AND
            file_id = (new.user_metadata ->> 'file_id')::uuid
        ) then
          insert into public.symlinks (directory_id, file_id, name) values ((new.user_metadata ->> 'directory_id')::uuid, (new.user_metadata ->> 'file_id')::uuid, _name);
        end if;

      end if;

    end if;

  end if;

  return coalesce(new, old);

end;$function$
;


