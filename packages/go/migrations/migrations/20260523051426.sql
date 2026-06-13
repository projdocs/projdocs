set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.can_current_user_org(_level public.permission_levels, _scope public.permission_scopes, _organization_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare
    _has public.permission_levels;
begin

    if _level = 'NONE' then
        return false;
    end if;

    select case _scope
               when 'ORGANIZATION' then p.organization
               when 'CLIENTS' then p.clients
               when 'PROJECTS' then p.projects
               else null
               end
    into _has
    from public.permissions p
             join public.members m
                  on m.permissions_id = p.id
                      and m.user_id = auth.uid()
    where p.organization_id = _organization_id;

    if _has is null then
        raise warning 'null permission unexpected for scope "%"', _scope;
        return false;
    end if;

    return case _level
               when 'VIEW' then _has = any (array ['VIEW', 'EDIT', 'DELETE']::public.permission_levels[])
               when 'EDIT' then _has = any (array ['EDIT', 'DELETE']::public.permission_levels[])
               when 'DELETE' then _has = any (array ['DELETE']::public.permission_levels[])
               else false
        end;

end;$function$
;

DROP POLICY "select" ON public.clients;
DROP POLICY "insert" ON public.clients;
DROP POLICY "update" ON public.clients;
DROP POLICY "delete" ON public.clients;

create policy "select"
    on "public"."clients"
    as permissive
    for select
    to authenticated
    using ((select private.can_current_user_org('VIEW'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                            organization_id) as can));

create policy "insert"
    on "public"."clients"
    as permissive
    for insert
    to authenticated
    with check ((select private.can_current_user_org('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                                     organization_id) as can));

create policy "update"
    on "public"."clients"
    as permissive
    for update
    to authenticated
    using ((select private.can_current_user_org('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                                organization_id) as can));

create policy "delete"
    on "public"."clients"
    as permissive
    for delete
    to authenticated
    using ((select private.can_current_user_org('DELETE'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                                organization_id) as can));

DROP POLICY "select" ON public.projects;
DROP POLICY "insert" ON public.projects;
DROP POLICY "update" ON public.projects;
DROP POLICY "delete" ON public.projects;

create policy "select"
    on "public"."projects"
    as permissive
    for select
    to authenticated
    using ((select private.can_current_user_org('VIEW'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            organization_id) as can));

create policy "insert"
    on "public"."projects"
    as permissive
    for insert
    to authenticated
    with check ((select private.can_current_user_org('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                                     organization_id) as can));

create policy "update"
    on "public"."projects"
    as permissive
    for update
    to authenticated
    using ((select private.can_current_user_org('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                                organization_id) as can));

create policy "delete"
    on "public"."projects"
    as permissive
    for delete
    to authenticated
    using ((select private.can_current_user_org('DELETE'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                                organization_id) as can));


