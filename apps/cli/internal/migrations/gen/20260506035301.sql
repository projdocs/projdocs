CREATE DOMAIN public.client_name AS TEXT
    NOT NULL
    CHECK (
        length(trim(value))           BETWEEN 1 AND 255
            AND trim(value)               = value
            AND value                     ~ '^[^\s].*[^\s]$|^[^\s]$'
            AND value                     !~ '\s{2,}'
        );

ALTER TABLE public.clients add column name public.client_name NOT NULL;