alter table "public"."organizations"
    add column "storage_providers_id" uuid not null;

alter table "public"."organizations"
    add constraint "organizations_storage_providers_id_fkey" FOREIGN KEY (storage_providers_id) REFERENCES public.storage_providers (id) ON UPDATE CASCADE not valid;

alter table "public"."organizations"
    validate constraint "organizations_storage_providers_id_fkey";


