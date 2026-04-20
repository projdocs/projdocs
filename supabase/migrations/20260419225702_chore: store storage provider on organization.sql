alter table "public"."organizations" add column "storage_provider_id" uuid;

alter table "public"."organizations" add constraint "organizations_storage_provider_id_fkey" FOREIGN KEY (storage_provider_id) REFERENCES public.storage_providers(id) ON UPDATE CASCADE not valid;

alter table "public"."organizations" validate constraint "organizations_storage_provider_id_fkey";