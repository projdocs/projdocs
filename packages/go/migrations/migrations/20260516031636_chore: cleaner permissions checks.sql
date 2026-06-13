create policy "select: own"
    on "public"."members"
    as permissive
    for select
    to authenticated
    using ((user_id = (SELECT auth.uid() AS uid)));

create policy "select: own"
    on "public"."permissions"
    as permissive
    for select
    to authenticated
    using ((id IN (SELECT m.permissions_id
                   FROM public.members m
                   WHERE (m.user_id = (SELECT auth.uid() AS uid)))));

CREATE TYPE public.permission_scopes AS ENUM (
    'ORGANIZATION',
    'CLIENTS',
    'PROJECTS'
    );

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION private.can_current_user(
    _level public.permission_levels,
    _scope public.permission_scopes,
    _id uuid
)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET SEARCH_PATH = ''
AS
$function$
begin

    -- none is placeholder for 'always false', so this should really never be passed in
    if _level = 'NONE' then
        return false;
    end if;

    if _scope = 'ORGANIZATION' then
        return _level = (select p.organization
                         from public.permissions p
                         where p.organization_id = _id
                           and p.id in
                               (select m.permissions_id from public.members m where m.user_id = (select auth.uid())));
    elsif _scope = 'CLIENTS' then
        return _level = (select p.clients
                         from public.permissions p
                         where p.organization_id = _id
                           and p.id in
                               (select m.permissions_id from public.members m where m.user_id = (select auth.uid())));
    elsif _scope = 'PROJECTS' then
        return _level = (select p.projects
                         from public.permissions p
                         where p.organization_id = _id
                           and p.id in
                               (select m.permissions_id from public.members m where m.user_id = (select auth.uid())));
    else
        raise exception 'scope "%" is unhandled', _scope;
    end if;
end;
$function$;

drop policy "select" on public.organizations;
create policy "select"
    on "public"."organizations"
    as permissive
    for select
    to authenticated
    using ((SELECT private.can_current_user(
                           'VIEW',
                           'ORGANIZATION',
                           id
                   ) AS can_select));

drop policy "select" on public.projects;
create policy "select"
    on "public"."projects"
    as permissive
    for select
    to authenticated
    using ((SELECT private.can_current_user(
                           'VIEW',
                           'PROJECTS',
                           id
                   ) AS can_select));

drop policy "select" on public.clients;
create policy "select"
    on "public"."clients"
    as permissive
    for select
    to authenticated
    using ((SELECT private.can_current_user(
                           'VIEW',
                           'CLIENTS',
                           id
                   ) AS can_select));

drop policy "select" on public.profiles;
create policy "select"
    on "public"."profiles"
    as permissive
    for select
    to authenticated
    using ((SELECT private.can_current_user(
                           'VIEW',
                           'ORGANIZATION',
                           organization_id
                   ) AS can_select));

drop function private.is_member(org_id uuid);