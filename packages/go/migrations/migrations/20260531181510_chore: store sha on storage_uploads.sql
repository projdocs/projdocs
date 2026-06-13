alter table public.storage_uploads
    add column checksum text null;
alter table public.storage_uploads
    add column file_version_id uuid null references public.files_versions (id) on update cascade deferrable initially deferred;

-- if file_id is present, checksum must be present
ALTER TABLE public.storage_uploads
    ADD CONSTRAINT chk_checksum_required_with_file_id
        CHECK (file_version_id IS NULL OR checksum IS NOT NULL);

ALTER TABLE public.storage_uploads
    DROP CONSTRAINT exactly_one_parent,
    ADD CONSTRAINT exactly_one_parent CHECK (
        1 >= (
            (folder_id IS NOT NULL)::int +
            (project_id IS NOT NULL)::int +
            (client_id IS NOT NULL)::int +
            (organization_id IS NOT NULL)::int +
            (file_version_id IS NOT NULL)::int
            )
        );