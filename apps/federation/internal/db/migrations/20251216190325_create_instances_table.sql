-- Migration: create_instances_table
-- Created: 2025-12-16T19:03:25Z UTC

CREATE TABLE instances
(
    id   TEXT PRIMARY KEY DEFAULT (
        lower(
                hex(randomblob(4)) || '-' ||
                hex(randomblob(2)) || '-4' ||
                substr(hex(randomblob(2)), 2) || '-' ||
                substr('89ab', abs(random()) % 4 + 1, 1) ||
                substr(hex(randomblob(2)), 2) || '-' ||
                hex(randomblob(6))
        )
        ),
    cidr TEXT NOT NULL
        CHECK (
            -- must end with /32
            cidr LIKE '%/32'

                -- must start with 172.16.
                AND cidr LIKE '172.16.%/32'

                -- exactly 4 octets + /32
                AND length(cidr) BETWEEN 13 AND 15

                -- only digits, dots, slash
                AND cidr GLOB '[0-9.]*\/32'
            )
);