set check_function_bodies = off;

create or replace function private.can_current_user(
    _level public.permission_levels,
    _scope public.permission_scopes,
    _id uuid
)
    returns boolean
    language plpgsql
    security definer
    set search_path to ''
as
$function$
declare
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
    where p.organization_id = (select case _scope
                                          when 'ORGANIZATION' then _id
                                          when 'CLIENTS'
                                              then (select c.organization_id from public.clients c where c.id = _id)
                                          when 'PROJECTS'
                                              then (select pr.organization_id from public.projects pr where pr.id = _id)
                                          else null
                                          end);

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

end;
$function$;

