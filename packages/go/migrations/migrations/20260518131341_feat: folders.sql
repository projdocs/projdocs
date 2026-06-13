alter table "public"."files"
    drop constraint "files_project_id_fkey";


alter table "public"."files"
    drop column "project_id";

create table public.folders
(
    id              uuid                     not null primary key default gen_random_uuid(),
    created_at      timestamp with time zone not null             default (now() AT TIME ZONE 'utc'::text),
    name            text                     not null check ((name ~ '^[a-zA-Z0-9 _\-\.]+$'::text)),
    folder_id       uuid                     null references public.folders (id) on update cascade on delete cascade,
    project_id      uuid                     null references public.projects (id) on update cascade on delete cascade,
    client_id       uuid                     null references public.clients (id) on update cascade on delete cascade,
    organization_id uuid                     null references public.organizations (id) on update cascade on delete cascade,
    constraint exactly_one_parent check (
        1 = (
            (folder_id is not null)::int +
            (project_id is not null)::int +
            (client_id is not null)::int +
            (organization_id is not null)::int
            )
        )
);

alter table public.folders
    enable row level security;

alter table "public"."files"
    add column "folders_id" uuid not null;

alter table "public"."files"
    add constraint "files_folders_id_fkey" FOREIGN KEY (folders_id) REFERENCES public.folders (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."files"
    validate constraint "files_folders_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.check_scope_permissions(
    _permission_level public.permission_levels,
    _organization_id uuid,
    _project_id uuid,
    _client_id uuid,
    _folder_id uuid
)
    RETURNS boolean
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
    SECURITY DEFINER
AS
$function$
BEGIN

    RETURN CASE
               WHEN (_organization_id IS NOT NULL) THEN (SELECT private.can_current_user(
                                                                       _permission_level,
                                                                       'ORGANIZATION'::public.permission_scopes,
                                                                       _organization_id))
               WHEN (_project_id IS NOT NULL) THEN (SELECT private.can_current_user(_permission_level,
                                                                                   'PROJECTS'::public.permission_scopes,
                                                                                   _project_id))
               WHEN (_client_id IS NOT NULL) THEN (SELECT private.can_current_user(_permission_level,
                                                                                  'CLIENTS'::public.permission_scopes,
                                                                                  _client_id))

               WHEN (_folder_id IS NOT NULL) THEN (select private.check_scope_permissions(_permission_level, _organization_id := f.organization_id, _project_id := f.project_id, _client_id := f.client_id, _folder_id := f.folder_id) from public.folders f where f.id = _folder_id)
               ELSE false
        END;

END;
$function$
;

create policy "select" on public.folders
    as permissive for select to authenticated
    using ((select private.check_scope_permissions('VIEW'::public.permission_levels, organization_id, project_id, client_id, folder_id) as can_select));

create policy "insert" on public.folders
    as permissive for insert to authenticated
    with check ((select private.check_scope_permissions('EDIT'::public.permission_levels, organization_id, project_id, client_id, folder_id) as can_insert));

create policy "update" on public.folders
    as permissive for update to authenticated
    using ((select private.check_scope_permissions('EDIT'::public.permission_levels, organization_id, project_id, client_id, folder_id) as can_update))
    with check ((select private.check_scope_permissions('EDIT'::public.permission_levels, organization_id, project_id, client_id, folder_id) as can_update));

create policy "delete" on public.folders
    as permissive for delete to authenticated
    using ((select private.check_scope_permissions('DELETE'::public.permission_levels, organization_id, project_id, client_id, folder_id) as can_delete));