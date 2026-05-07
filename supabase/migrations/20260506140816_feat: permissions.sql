create type public.permission_levels as enum (
    'NONE',
    'VIEW',
    'EDIT',
    'DELETE'
    );

create table if not exists public.permissions
(
    id                uuid                     not null primary key default gen_random_uuid(),
    clients           public.permission_levels not null             default 'NONE'::public.permission_levels,
    projects          public.permission_levels not null             default 'NONE'::public.permission_levels,
    organization      public.permission_levels not null             default 'NONE'::public.permission_levels,
    organization_id   UUID                     NULL REFERENCES public.organizations (id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    display           text                     not null CHECK (
        display ~ '^[a-zA-Z][a-zA-Z0-9 _-]{1,48}[a-zA-Z0-9]$'
        ),
    __is_default_role boolean                  not null             default false
);

alter table public.permissions
    enable row level security;

alter table "public"."members"
    drop column "is_admin";

alter table "public"."members"
    add column "permissions_id" uuid not null;

alter table "public"."members"
    add constraint "members_permissions_id_fkey" FOREIGN KEY (permissions_id) REFERENCES public.permissions (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."members"
    validate constraint "members_permissions_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.organizations_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SET SEARCH_PATH = ''
AS
$function$
BEGIN
    RETURN coalesce(new, old);
END;
$function$
;

CREATE OR REPLACE FUNCTION triggers.users_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''
AS
$function$
begin
    if tg_op = 'INSERT' then
        WITH organization AS (SELECT *
                              FROM public.organizations
                              WHERE auto_add_members = true),
             permission AS (SELECT p.*
                            FROM public.permissions p
                                     INNER JOIN organization o ON p.organization_id = o.id
                            WHERE p.__is_default_role = true
                              AND p.display = 'None')
        INSERT
        INTO public.members (user_id, organization_id, permissions_id)
        SELECT NEW.id, o.id, p.id
        FROM organization o INNER JOIN permission p ON p.organization_id = o.id;
    elsif tg_op = 'UPDATE' then
    else -- DELETE
    end if;
    return coalesce(new, old);
end;
$function$
;


