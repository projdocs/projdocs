alter table public.files_versions
    add column size bigint not null default (0) check ( size > 0 );