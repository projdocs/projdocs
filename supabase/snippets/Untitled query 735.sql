alter table
  public.projects
add column
  __full_text_search tsvector generated always as (to_tsvector('english', display || ' ' || number::text)) stored;
create index projects_fts on public.projects using gin (__full_text_search);