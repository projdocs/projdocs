create table "public"."clients_projects"
(
    "id"              uuid                     not null default gen_random_uuid(),
    "created_at"      timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "client_id"       uuid                     not null,
    "project_id"      uuid                     not null,
    "organization_id" uuid                     not null,
    unique (client_id, project_id, organization_id)
);


alter table "public"."clients_projects"
    enable row level security;

CREATE UNIQUE INDEX client_projects_pkey ON public.clients_projects USING btree (id);

alter table "public"."clients_projects"
    add constraint "client_projects_pkey" PRIMARY KEY using index "client_projects_pkey";

alter table "public"."clients_projects"
    add constraint "clients_projects_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_projects"
    validate constraint "clients_projects_client_id_fkey";

alter table "public"."clients_projects"
    add constraint "clients_projects_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_projects"
    validate constraint "clients_projects_project_id_fkey";

alter table "public"."clients_projects"
    add constraint "clients_projects_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_projects"
    validate constraint "clients_projects_organization_id_fkey";

create policy "select"
    on "public"."clients_projects"
    as permissive
    for select
    to authenticated
    using (((SELECT private.can_current_user('VIEW'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                             clients_projects.organization_id) AS can_select_projects) AND
            (SELECT private.can_current_user('VIEW'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                             clients_projects.organization_id) AS can_select_clients)));

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION private.clients_projects_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS
$function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF
            ((select client.organization_id from public.clients client where client.id = NEW.client_id limit 1) <>
             NEW.organization_id) OR
            ((select project.organization_id from public.projects project where project.id = NEW.project_id limit 1) <>
             NEW.organization_id)
        THEN
            RAISE EXCEPTION 'client and project must belong to the same organization';
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'clients_projects can only be inserted or deleted, not updated';
    END IF;
    RETURN COALESCE(new, old);
END;
$function$
;

CREATE TRIGGER before_actions
    before insert or update or delete
    on public.clients_projects
    for each row
execute function private.clients_projects_before_actions();