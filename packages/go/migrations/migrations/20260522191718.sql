ALTER TABLE public.organizations
    ADD COLUMN storage_upload_id uuid not null,
    ADD CONSTRAINT organizations_storage_uploads_id_fkey
        FOREIGN KEY (storage_upload_id)
            REFERENCES public.storage_uploads (id)
            ON UPDATE CASCADE
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.folders
    ADD COLUMN storage_upload_id uuid not null,
    ADD CONSTRAINT folders_storage_uploads_id_fkey
        FOREIGN KEY (storage_upload_id)
            REFERENCES public.storage_uploads (id)
            ON UPDATE CASCADE
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.clients
    ADD COLUMN storage_upload_id uuid not null,
    ADD CONSTRAINT clients_storage_uploads_id_fkey
        FOREIGN KEY (storage_upload_id)
            REFERENCES public.storage_uploads (id)
            ON UPDATE CASCADE
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.projects
    ADD COLUMN storage_upload_id uuid not null,
    ADD CONSTRAINT projects_storage_uploads_id_fkey
        FOREIGN KEY (storage_upload_id)
            REFERENCES public.storage_uploads (id)
            ON UPDATE CASCADE
            DEFERRABLE INITIALLY DEFERRED;