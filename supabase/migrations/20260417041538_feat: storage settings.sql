create type "public"."settings_storage_type" as enum ('GOOGLE_DRIVE');


create table "public"."settings_storage"
(
    "id"       boolean                      not null default true,
    "type"     public.settings_storage_type not null default 'GOOGLE_DRIVE'::public.settings_storage_type,
    "data"     jsonb                        not null default '{}'::jsonb,
    "is_valid" boolean                      not null default false
);


alter table "public"."settings_storage"
    enable row level security;

CREATE UNIQUE INDEX settings_storage_pkey ON public.settings_storage USING btree (id);

alter table "public"."settings_storage"
    add constraint "settings_storage_pkey" PRIMARY KEY using index "settings_storage_pkey";

alter table "public"."settings_storage"
    add constraint "settings_storage_id_check" CHECK ((id = true)) not valid;

alter table "public"."settings_storage"
    validate constraint "settings_storage_id_check";

grant delete on table "public"."settings_storage" to "anon";

grant insert on table "public"."settings_storage" to "anon";

grant references on table "public"."settings_storage" to "anon";

grant select on table "public"."settings_storage" to "anon";

grant trigger on table "public"."settings_storage" to "anon";

grant truncate on table "public"."settings_storage" to "anon";

grant update on table "public"."settings_storage" to "anon";

grant delete on table "public"."settings_storage" to "authenticated";

grant insert on table "public"."settings_storage" to "authenticated";

grant references on table "public"."settings_storage" to "authenticated";

grant select on table "public"."settings_storage" to "authenticated";

grant trigger on table "public"."settings_storage" to "authenticated";

grant truncate on table "public"."settings_storage" to "authenticated";

grant update on table "public"."settings_storage" to "authenticated";

grant delete on table "public"."settings_storage" to "service_role";

grant insert on table "public"."settings_storage" to "service_role";

grant references on table "public"."settings_storage" to "service_role";

grant select on table "public"."settings_storage" to "service_role";

grant trigger on table "public"."settings_storage" to "service_role";

grant truncate on table "public"."settings_storage" to "service_role";

grant update on table "public"."settings_storage" to "service_role";


