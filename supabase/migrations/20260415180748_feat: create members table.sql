create table "public"."members"
(
    "id"              uuid not null default gen_random_uuid(),
    "user_id"         uuid not null,
    "organization_id" uuid not null,
    unique (user_id, organization_id)
);


alter table "public"."members"
    enable row level security;

CREATE UNIQUE INDEX members_pkey ON public.members USING btree (id);

alter table "public"."members"
    add constraint "members_pkey" PRIMARY KEY using index "members_pkey";

alter table "public"."members"
    add constraint "members_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."members"
    validate constraint "members_organization_id_fkey";

alter table "public"."members"
    add constraint "members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."members"
    validate constraint "members_user_id_fkey";

grant delete on table "public"."members" to "anon";

grant insert on table "public"."members" to "anon";

grant references on table "public"."members" to "anon";

grant select on table "public"."members" to "anon";

grant trigger on table "public"."members" to "anon";

grant truncate on table "public"."members" to "anon";

grant update on table "public"."members" to "anon";

grant delete on table "public"."members" to "authenticated";

grant insert on table "public"."members" to "authenticated";

grant references on table "public"."members" to "authenticated";

grant select on table "public"."members" to "authenticated";

grant trigger on table "public"."members" to "authenticated";

grant truncate on table "public"."members" to "authenticated";

grant update on table "public"."members" to "authenticated";

grant delete on table "public"."members" to "service_role";

grant insert on table "public"."members" to "service_role";

grant references on table "public"."members" to "service_role";

grant select on table "public"."members" to "service_role";

grant trigger on table "public"."members" to "service_role";

grant truncate on table "public"."members" to "service_role";

grant update on table "public"."members" to "service_role";


