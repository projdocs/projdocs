alter table public.clients
    add column __full_text_search tsvector generated always as (
        to_tsvector('english', name || ' ' || number::text)
        ) stored;
create index clients_fts on public.clients using gin (__full_text_search);

alter table public.projects
    add column __full_text_search tsvector generated always as (
        to_tsvector('english', display || ' ' || number::text)
        ) stored;
create index projects_fts on public.projects using gin (__full_text_search);

create type public.searchable_tables as enum ('CLIENTS', 'PROJECTS');
create or replace function public.search_table(
    _table public.searchable_tables,
    _query text,
    _limit int default 25
)
    returns table
            (
                number  bigint,
                id      uuid,
                display text,
                rank    real
            )
    language plpgsql
    set search_path = ''
    security invoker
as
$$
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
            where p.__full_text_search @@ _tsquery
            order by rank desc
            limit _limit_clamped;

        when 'CLIENTS' then return query
            select c.number,
                   c.id,
                   c.name::text,
                   ts_rank(c.__full_text_search, _tsquery) as rank
            from public.clients c
            where c.__full_text_search @@ _tsquery
            order by rank desc
            limit _limit_clamped;
        end case;
end;
$$;




