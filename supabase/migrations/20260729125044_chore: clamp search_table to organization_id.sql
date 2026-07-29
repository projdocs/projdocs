drop function if exists "public"."search_table"(_table public.searchable_tables, _query text, _limit integer);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_table(_table public.searchable_tables, _query text, _organization_id text, _limit integer DEFAULT 25)
 RETURNS TABLE(number bigint, id uuid, display text, rank real)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
    _tsquery       tsquery := to_tsquery('english', regexp_replace(
                                                            regexp_replace(trim(_query), '[^\w\s]', '', 'g'), -- strip special chars
                                                            '\s+', ':* & ', 'g' -- join words with prefix wildcard
                                                    ) || ':*'
                              );
    _max_results   int     := 100;
    _limit_clamped int     := least(_limit, _max_results);
begin

    if _limit > _limit_clamped then
        raise warning 'search_table clamped results to % (requested: %, maximum: %)', _limit_clamped::text, _limit::text, _max_results::text;
    end if;

    case _table
        when 'PROJECTS' then return query
            select p.number,
                   p.id,
                   p.display,
                   ts_rank(p.__full_text_search, _tsquery) as rank
            from public.projects p
            where p.__full_text_search @@ _tsquery and p.organization_id = _organization_id
            order by rank desc
            limit _limit_clamped;

        when 'CLIENTS' then return query
            select c.number,
                   c.id,
                   c.name::text,
                   ts_rank(c.__full_text_search, _tsquery) as rank
            from public.clients c
            where c.__full_text_search @@ _tsquery and c.organization_id = _organization_id
            order by rank desc
            limit _limit_clamped;
        end case;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.organizations_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare
    _no_op_id uuid := gen_random_uuid();
begin
    if tg_op = 'INSERT' then

        -- use default
        IF NEW.storage_providers_id IS NULL THEN
          NEW.storage_providers_id := (select id from public.storage_providers where type = 'BUILT_IN'::public.settings_storage_type limit 1);
        END IF;

        -- create admin role
        INSERT INTO public.permissions (display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES ('Administrator',
                'DELETE'::public.permission_levels,
                'DELETE'::public.permission_levels,
                'DELETE'::public.permission_levels,
                NEW.id,
                true);

        -- create view-only role
        INSERT INTO public.permissions (display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES ('View-Only',
                'VIEW'::public.permission_levels,
                'VIEW'::public.permission_levels,
                'VIEW'::public.permission_levels,
                NEW.id,
                true);

        -- create editor role
        INSERT INTO public.permissions (display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES ('Editor',
                'EDIT'::public.permission_levels,
                'EDIT'::public.permission_levels,
                'EDIT'::public.permission_levels,
                NEW.id,
                true);

        -- create no-op role
        INSERT INTO public.permissions (id,
                                        display,
                                        clients,
                                        projects,
                                        organization,
                                        organization_id,
                                        __is_default_role)
        VALUES (_no_op_id,
                'None',
                'NONE'::public.permission_levels,
                'NONE'::public.permission_levels,
                'NONE'::public.permission_levels,
                NEW.id,
                true);
        NEW.default_permissions_id := _no_op_id;
    elsif tg_op = 'UPDATE' then
        NEW.id := OLD.id;
    end if;

    return coalesce(new, old);
end;$function$
;

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."clients_projects" to "anon";

grant insert on table "public"."clients_projects" to "anon";

grant select on table "public"."clients_projects" to "anon";

grant update on table "public"."clients_projects" to "anon";

grant delete on table "public"."clients_projects" to "authenticated";

grant insert on table "public"."clients_projects" to "authenticated";

grant select on table "public"."clients_projects" to "authenticated";

grant update on table "public"."clients_projects" to "authenticated";

grant delete on table "public"."clients_projects" to "service_role";

grant insert on table "public"."clients_projects" to "service_role";

grant select on table "public"."clients_projects" to "service_role";

grant update on table "public"."clients_projects" to "service_role";

grant delete on table "public"."favorites" to "anon";

grant insert on table "public"."favorites" to "anon";

grant select on table "public"."favorites" to "anon";

grant update on table "public"."favorites" to "anon";

grant delete on table "public"."favorites" to "authenticated";

grant insert on table "public"."favorites" to "authenticated";

grant select on table "public"."favorites" to "authenticated";

grant update on table "public"."favorites" to "authenticated";

grant delete on table "public"."favorites" to "service_role";

grant insert on table "public"."favorites" to "service_role";

grant select on table "public"."favorites" to "service_role";

grant update on table "public"."favorites" to "service_role";

grant delete on table "public"."files" to "anon";

grant insert on table "public"."files" to "anon";

grant select on table "public"."files" to "anon";

grant update on table "public"."files" to "anon";

grant delete on table "public"."files" to "authenticated";

grant insert on table "public"."files" to "authenticated";

grant select on table "public"."files" to "authenticated";

grant update on table "public"."files" to "authenticated";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";

grant delete on table "public"."files_versions" to "anon";

grant insert on table "public"."files_versions" to "anon";

grant select on table "public"."files_versions" to "anon";

grant update on table "public"."files_versions" to "anon";

grant delete on table "public"."files_versions" to "authenticated";

grant insert on table "public"."files_versions" to "authenticated";

grant select on table "public"."files_versions" to "authenticated";

grant update on table "public"."files_versions" to "authenticated";

grant delete on table "public"."files_versions" to "service_role";

grant insert on table "public"."files_versions" to "service_role";

grant select on table "public"."files_versions" to "service_role";

grant update on table "public"."files_versions" to "service_role";

grant delete on table "public"."folders" to "anon";

grant insert on table "public"."folders" to "anon";

grant select on table "public"."folders" to "anon";

grant update on table "public"."folders" to "anon";

grant delete on table "public"."folders" to "authenticated";

grant insert on table "public"."folders" to "authenticated";

grant select on table "public"."folders" to "authenticated";

grant update on table "public"."folders" to "authenticated";

grant delete on table "public"."folders" to "service_role";

grant insert on table "public"."folders" to "service_role";

grant select on table "public"."folders" to "service_role";

grant update on table "public"."folders" to "service_role";

grant delete on table "public"."permissions" to "anon";

grant insert on table "public"."permissions" to "anon";

grant select on table "public"."permissions" to "anon";

grant update on table "public"."permissions" to "anon";

grant delete on table "public"."permissions" to "authenticated";

grant insert on table "public"."permissions" to "authenticated";

grant select on table "public"."permissions" to "authenticated";

grant update on table "public"."permissions" to "authenticated";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."storage_uploads" to "anon";

grant insert on table "public"."storage_uploads" to "anon";

grant select on table "public"."storage_uploads" to "anon";

grant update on table "public"."storage_uploads" to "anon";

grant delete on table "public"."storage_uploads" to "authenticated";

grant insert on table "public"."storage_uploads" to "authenticated";

grant select on table "public"."storage_uploads" to "authenticated";

grant update on table "public"."storage_uploads" to "authenticated";

grant delete on table "public"."storage_uploads" to "service_role";

grant insert on table "public"."storage_uploads" to "service_role";

grant select on table "public"."storage_uploads" to "service_role";

grant update on table "public"."storage_uploads" to "service_role";


