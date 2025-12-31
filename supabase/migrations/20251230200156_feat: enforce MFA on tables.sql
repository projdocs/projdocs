DO
$$
    DECLARE
        r           RECORD;
        policy_name text := 'ALL: MFA';
    BEGIN
        FOR r IN
            SELECT schemaname, tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            LOOP
                -- Enable RLS if not enabled
                EXECUTE format(
                        'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;',
                        r.schemaname,
                        r.tablename
                        );

                -- Drop existing policy if it already exists
                EXECUTE format(
                        'DROP POLICY IF EXISTS %I ON %I.%I;',
                        policy_name,
                        r.schemaname,
                        r.tablename
                        );

                -- Create MFA policy
                EXECUTE format(
                        'CREATE POLICY %I
                         ON %I.%I
                         AS RESTRICTIVE
                         TO authenticated
                         USING ((select auth.jwt()->>''aal'') = ''aal2'');',
                        policy_name,
                        r.schemaname,
                        r.tablename
                        );
            END LOOP;
    END
$$;