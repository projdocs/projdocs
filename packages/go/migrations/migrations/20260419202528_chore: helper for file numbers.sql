SET check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.next_file_number(_organization_id uuid)
    RETURNS bigint
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS $function$
DECLARE
    _sequence text := FORMAT('org_%s_file_sequence', REPLACE(_organization_id::text, '-', ''));
    _next bigint;
BEGIN
    EXECUTE FORMAT('CREATE SEQUENCE IF NOT EXISTS triggers.%I AS BIGINT INCREMENT BY 1 MINVALUE 0 NO MAXVALUE', _sequence);
    EXECUTE FORMAT('SELECT NEXTVAL(''triggers.%I'')', _sequence) INTO _next;
    RETURN _next;
END;
$function$;


