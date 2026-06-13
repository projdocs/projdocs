alter table public.files
    add column name text not null check ((name ~ '^[a-zA-Z0-9 _\-\.]+$'::text));