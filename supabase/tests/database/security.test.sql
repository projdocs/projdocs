begin;

-- Deallocate any prepared statements to reset the session
DEALLOCATE PREPARE ALL;

-- Revert all changes on failure
\set ON_ERROR_ROLLBACK 1
\set ON_ERROR_STOP true

SELECT extensions.plan(2);

SELECT extensions.is(
               (SELECT COUNT(*)::integer
                FROM pg_class c
                         JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                  AND c.relrowsecurity = FALSE
                  AND n.nspname = 'public'),
               0,
               'All tables in the public schema should have RLS enabled'
       );

SELECT extensions.ok(
               (SELECT COUNT(*)::integer
                FROM pg_class c
                         JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                  AND n.nspname = 'public') > 0,
               'The public schema should contain at least one table'
       );

SELECT *
FROM extensions.finish();

rollback;