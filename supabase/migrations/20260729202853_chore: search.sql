drop function if exists "public"."search_table"(_table public.searchable_tables, _query text, _organization_id text, _limit integer);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_table(_table public.searchable_tables, _query text, _organization_id uuid, _limit integer DEFAULT 25)
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