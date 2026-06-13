ALTER TABLE public.clients
    ADD CONSTRAINT clients_name_organization_id_unique_key UNIQUE (name, organization_id);

ALTER TABLE public.projects
    ADD CONSTRAINT projects_display_organization_id_unique_key UNIQUE (display, organization_id);