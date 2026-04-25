alter table "public"."organizations"
    drop constraint "organizations_storage_provider_id_fkey";


create table "public"."storage_links"
(
    "id"                  uuid not null default gen_random_uuid(),
    "key"                 text,
    "storage_provider_id" uuid not null default gen_random_uuid()
);


alter table "public"."storage_links"
    enable row level security;

alter table "public"."organizations"
    drop column "storage_provider_id";

alter table "public"."organizations"
    add column "storage_link_id" uuid;

CREATE UNIQUE INDEX storage_link_pkey ON public.storage_links USING btree (id);

alter table "public"."storage_links"
    add constraint "storage_link_pkey" PRIMARY KEY using index "storage_link_pkey";

alter table "public"."organizations"
    add constraint "organizations_storage_link_fkey" FOREIGN KEY (storage_link_id) REFERENCES public.storage_links (id) ON UPDATE CASCADE not valid;

alter table "public"."organizations"
    validate constraint "organizations_storage_link_fkey";

alter table "public"."storage_links"
    add constraint "storage_link_storage_provider_id_fkey" FOREIGN KEY (storage_provider_id) REFERENCES public.storage_providers (id) ON UPDATE CASCADE not valid;

alter table "public"."storage_links"
    validate constraint "storage_link_storage_provider_id_fkey";

grant delete on table "public"."storage_links" to "anon";

grant insert on table "public"."storage_links" to "anon";

grant references on table "public"."storage_links" to "anon";

grant select on table "public"."storage_links" to "anon";

grant trigger on table "public"."storage_links" to "anon";

grant truncate on table "public"."storage_links" to "anon";

grant update on table "public"."storage_links" to "anon";

grant delete on table "public"."storage_links" to "authenticated";

grant insert on table "public"."storage_links" to "authenticated";

grant references on table "public"."storage_links" to "authenticated";

grant select on table "public"."storage_links" to "authenticated";

grant trigger on table "public"."storage_links" to "authenticated";

grant truncate on table "public"."storage_links" to "authenticated";

grant update on table "public"."storage_links" to "authenticated";

grant delete on table "public"."storage_links" to "service_role";

grant insert on table "public"."storage_links" to "service_role";

grant references on table "public"."storage_links" to "service_role";

grant select on table "public"."storage_links" to "service_role";

grant trigger on table "public"."storage_links" to "service_role";

grant truncate on table "public"."storage_links" to "service_role";

grant update on table "public"."storage_links" to "service_role";


