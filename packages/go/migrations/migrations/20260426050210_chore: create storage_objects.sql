create table "public"."storage_folders"
(
    "id"                  uuid not null default gen_random_uuid(),
    "storage_provider_id" uuid not null,
    "value"               text not null,
    "parent_id"           uuid
);


alter table "public"."storage_folders"
    enable row level security;

CREATE UNIQUE INDEX storage_objects_pkey ON public.storage_folders USING btree (id);

alter table "public"."storage_folders"
    add constraint "storage_objects_pkey" PRIMARY KEY using index "storage_objects_pkey";

alter table "public"."storage_folders"
    add constraint "storage_objects_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.storage_folders (id) ON UPDATE CASCADE not valid;

alter table "public"."storage_folders"
    validate constraint "storage_objects_parent_id_fkey";

alter table "public"."storage_folders"
    add constraint "storage_objects_storage_provider_id_fkey" FOREIGN KEY (storage_provider_id) REFERENCES public.storage_providers (id) ON UPDATE CASCADE not valid;

alter table "public"."storage_folders"
    validate constraint "storage_objects_storage_provider_id_fkey";
