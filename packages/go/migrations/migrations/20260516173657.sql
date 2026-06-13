create table "public"."storage_uploads"
(
    "id"                  uuid                     not null default gen_random_uuid(),
    "created_at"          timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "provider_id"         text                     not null,
    "storage_provider_id" uuid                     not null
);


alter table "public"."storage_uploads"
    enable row level security;

CREATE UNIQUE INDEX files_pkey ON public.storage_uploads USING btree (id);

alter table "public"."storage_uploads"
    add constraint "files_pkey" PRIMARY KEY using index "files_pkey";

alter table "public"."storage_uploads"
    add constraint "files_storage_provider_id_fkey" FOREIGN KEY (storage_provider_id) REFERENCES public.storage_providers (id) ON UPDATE CASCADE not valid;

alter table "public"."storage_uploads"
    validate constraint "files_storage_provider_id_fkey";

