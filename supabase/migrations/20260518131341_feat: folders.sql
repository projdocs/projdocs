alter table "public"."files"
    drop constraint "files_project_id_fkey";


alter table "public"."files"
    drop column "project_id";

create table public.folders
(
    id              uuid                     not null primary key default gen_random_uuid(),
    created_at      timestamp with time zone not null             default (now() AT TIME ZONE 'utc'::text),
    name            text                     not null check ((name ~ '^[a-zA-Z0-9 _\-\.]+$'::text)),
    parent_id       uuid                     null references public.folders (id) on update cascade on delete cascade,
    project_id      uuid                     null references public.projects (id) on update cascade on delete cascade,
    client_id       uuid                     null references public.clients (id) on update cascade on delete cascade,
    organization_id uuid                     null references public.organizations (id) on update cascade on delete cascade,
    member_id       uuid                     null references public.members (id) on update cascade on delete cascade,
    constraint exactly_one_parent check (
        1 = (
            (parent_id is not null)::int +
            (project_id is not null)::int +
            (client_id is not null)::int +
            (organization_id is not null)::int +
            (member_id is not null)::int
            )
        )
);

create policy "select" on public.folders
    as permissive for select to authenticated
    using (
    case
        when organization_id is not null then
            (select private.can_current_user('VIEW'::public.permission_levels, 'ORGANIZATION'::public.permission_scopes,
                                             organization_id))
        when project_id is not null then
            (select private.can_current_user('VIEW'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                             project_id))
        when client_id is not null then
            (select private.can_current_user('VIEW'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                             client_id))
        when member_id is not null then
            member_id in (select m.id
                          from public.members m
                          where m.user_id = auth.uid())
        else false
        end
    );

create policy "insert" on public.folders
    as permissive for insert to authenticated -- was: for select
    with check (
    case
        when organization_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'ORGANIZATION'::public.permission_scopes,
                                             organization_id))
        when project_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                             project_id))
        when client_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                             client_id))
        when member_id is not null then
            member_id in (select m.id
                          from public.members m
                          where m.user_id = auth.uid())
        else false
        end
    );

create policy "update" on public.folders
    as permissive for update to authenticated -- was: for select
    using (
    case
        when organization_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'ORGANIZATION'::public.permission_scopes,
                                             organization_id))
        when project_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                             project_id))
        when client_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                             client_id))
        when member_id is not null then
            member_id in (select m.id
                          from public.members m
                          where m.user_id = auth.uid())
        else false
        end
    )
    with check ( -- added: validates post-update row state
    case
        when organization_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'ORGANIZATION'::public.permission_scopes,
                                             organization_id))
        when project_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                             project_id))
        when client_id is not null then
            (select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                             client_id))
        when member_id is not null then
            member_id in (select m.id
                          from public.members m
                          where m.user_id = auth.uid())
        else false
        end
    );

create policy "delete" on public.folders
    as permissive for delete to authenticated -- was: for select
    using (
    case
        when organization_id is not null then
            (select private.can_current_user('DELETE'::public.permission_levels,
                                             'ORGANIZATION'::public.permission_scopes, organization_id))
        when project_id is not null then
            (select private.can_current_user('DELETE'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                             project_id))
        when client_id is not null then
            (select private.can_current_user('DELETE'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                             client_id))
        when member_id is not null then
            member_id in (select m.id
                          from public.members m
                          where m.user_id = auth.uid())
        else false
        end
    );


alter table public.folders
    enable row level security;

alter table "public"."files"
    add column "folders_id" uuid not null;

alter table "public"."files"
    add constraint "files_folders_id_fkey" FOREIGN KEY (folders_id) REFERENCES public.folders (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."files"
    validate constraint "files_folders_id_fkey";