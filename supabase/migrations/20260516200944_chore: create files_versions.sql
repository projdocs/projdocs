create table "public"."files_versions"
(
    id                 uuid primary key         not null default gen_random_uuid(),
    created_at         timestamp with time zone not null default now(),
    storage_uploads_id uuid                     not null references public.storage_uploads (id) deferrable initially deferred,
    files_id           uuid                     not null references public.files (id) deferrable initially deferred,
    unique (files_id, storage_uploads_id)
);

alter table "public"."files_versions"
    enable row level security;