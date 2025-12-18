-- Migration: create_instances_table
-- Created: 2025-12-16T19:03:25Z UTC

CREATE TABLE instances
(
    id           INTEGER PRIMARY KEY,
    uid          TEXT UNIQUE DEFAULT (
        lower(
                hex(randomblob(4)) || '-' ||
                hex(randomblob(2)) || '-4' ||
                substr(hex(randomblob(2)), 2) || '-' ||
                substr('89ab', abs(random()) % 4 + 1, 1) ||
                substr(hex(randomblob(2)), 2) || '-' ||
                hex(randomblob(6))
        )
        ),
    container_id INTEGER NOT NULL UNIQUE,
    cidr         TEXT    NOT NULL CHECK (
        cidr LIKE '172.16.%/32' AND
        cidr GLOB '172.16.[0-9]*.[0-9]*/32' AND
        length(cidr) BETWEEN 13 AND 18
        )
);