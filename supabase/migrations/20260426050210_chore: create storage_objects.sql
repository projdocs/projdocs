create type "public"."storage_object_types" as enum ('FILE', 'FOLDER');

create sequence "triggers"."org_2300999d4d914588be88ffed0f29b90c_client_sequence";


  create table "public"."storage_objects" (
    "id" uuid not null default gen_random_uuid(),
    "type" public.storage_object_types not null,
    "storage_provider_id" uuid not null,
    "value" text not null,
    "parent_id" uuid
      );


alter table "public"."storage_objects" enable row level security;

CREATE UNIQUE INDEX storage_objects_pkey ON public.storage_objects USING btree (id);

alter table "public"."storage_objects" add constraint "storage_objects_pkey" PRIMARY KEY using index "storage_objects_pkey";

alter table "public"."storage_objects" add constraint "storage_objects_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.storage_objects(id) ON UPDATE CASCADE not valid;

alter table "public"."storage_objects" validate constraint "storage_objects_parent_id_fkey";

alter table "public"."storage_objects" add constraint "storage_objects_storage_provider_id_fkey" FOREIGN KEY (storage_provider_id) REFERENCES public.storage_providers(id) ON UPDATE CASCADE not valid;

alter table "public"."storage_objects" validate constraint "storage_objects_storage_provider_id_fkey";
