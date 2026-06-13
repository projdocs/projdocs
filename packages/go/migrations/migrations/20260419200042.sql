ALTER TABLE public.settings_storage
    RENAME COLUMN id TO _id;

ALTER TABLE public.settings_storage
    DROP CONSTRAINT settings_storage_pkey,
    DROP CONSTRAINT settings_storage_id_check;

ALTER TABLE public.settings_storage
    ADD COLUMN id uuid primary key not null default gen_random_uuid();

ALTER TABLE public.settings_storage
    DROP COLUMN _id;

ALTER TABLE public.settings_storage RENAME to storage_providers;