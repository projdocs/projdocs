CREATE OR REPLACE FUNCTION private.restrictive_security()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
AS
$$
DECLARE
    aal          text;
    uid          uuid;
    is_suspended boolean;
BEGIN
    -- Read JWT once, reuse it
    WITH claims AS (SELECT auth.jwt() AS jwt)
    SELECT claims.jwt ->> 'aal',
           (claims.jwt ->> 'sub')::uuid
    INTO
        aal,
        uid
    FROM claims;
    IF uid IS NULL OR aal IS NULL THEN
        RETURN FALSE;
    END IF;

    -- enforce MFA
    IF aal <> 'aal2' THEN
        RETURN FALSE;
    END IF;

    -- enforce suspended
    SELECT u.is_suspended FROM public.users u WHERE u.id = uid INTO is_suspended;
    is_suspended := COALESCE(is_suspended, TRUE);
    RETURN is_suspended IS NOT TRUE;
END;
$$;

-- 2) Apply MFA + not-suspended policy to every public table
DO
$$
    DECLARE
        r               RECORD;
        old_policy_name text := 'ALL: MFA';
        new_policy_name text := 'ALL: Enhanced Security (Restrictive)';
    BEGIN
        FOR r IN
            SELECT schemaname, tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            LOOP
                EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schemaname, r.tablename);

                EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', old_policy_name, r.schemaname, r.tablename);

                EXECUTE format(
                        'CREATE POLICY %I
                         ON %I.%I
                         AS RESTRICTIVE
                         TO authenticated
                         USING ((SELECT private.restrictive_security()));',
                        new_policy_name,
                        r.schemaname,
                        r.tablename
                        );
            END LOOP;
    END
$$;