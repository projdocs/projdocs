ALTER TABLE public.storage_uploads
    ADD COLUMN folder_id       uuid NULL REFERENCES public.folders (id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ADD COLUMN project_id      uuid NULL REFERENCES public.projects (id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ADD COLUMN client_id       uuid NULL REFERENCES public.clients (id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ADD COLUMN organization_id uuid NULL REFERENCES public.organizations (id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT exactly_one_parent CHECK (
        1 = (
            (folder_id IS NOT NULL)::int +
            (project_id IS NOT NULL)::int +
            (client_id IS NOT NULL)::int +
            (organization_id IS NOT NULL)::int
            )
        );