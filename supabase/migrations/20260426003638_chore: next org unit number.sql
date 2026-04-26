SET check_function_bodies = off;

DROP FUNCTION triggers.next_file_number(_organization_id uuid);

CREATE TYPE triggers.organization_sequences as ENUM ('file', 'project', 'client');

CREATE OR REPLACE FUNCTION triggers.next_number(
    _organization_id uuid,
    _type triggers.organization_sequences
)
    RETURNS bigint
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS $function$
DECLARE
    _sequence text := FORMAT('org_%s_%s_sequence', REPLACE(_organization_id::text, '-', ''), _type::text);
    _next bigint;
BEGIN

    IF NOT EXISTS(SELECT 1 FROM PUBLIC.ORGANIZATIONS O WHERE O.ID = _organization_id) THEN
        RAISE EXCEPTION 'organization (id="%") does not exist or was not accessible', _organization_id;
    END IF;

    EXECUTE FORMAT('CREATE SEQUENCE IF NOT EXISTS triggers.%I AS BIGINT INCREMENT BY 1 MINVALUE 1 NO MAXVALUE', _sequence);
    EXECUTE FORMAT('SELECT NEXTVAL(''triggers.%I'')', _sequence) INTO _next;
    RETURN _next;
END;
$function$;