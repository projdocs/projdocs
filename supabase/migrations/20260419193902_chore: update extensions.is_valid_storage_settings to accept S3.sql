set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.is_valid_storage_settings(_type public.settings_storage_type, _data jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$BEGIN
  IF _type = 'S3'::public.settings_storage_type THEN
    return extensions.jsonb_matches_schema(
      instance := _data,
      schema := '{
        "type": "object",
        "required": ["bucket", "accessKeyId", "secretKey", "endpoint", "region"],
        "additionalProperties": false,
        "properties": {
          "bucket": {
            "type": "string"
          },
          "accessKeyId": {
            "type": "string"
          },
          "secretKey": {
            "type": "string"
          },
          "endpoint": {
            "type": "string",
            "format": "uri"
          },
          "region": {
            "type": "string"
          }
        }
      }'
    );
  ELSIF _type = 'GOOGLE_DRIVE'::public.settings_storage_type THEN
    return extensions.jsonb_matches_schema(
      instance := _data,
      schema := '{
        "type": "object",
        "required": [
          "type",
          "project_id",
          "private_key_id",
          "private_key",
          "client_email",
          "client_id",
          "auth_uri",
          "token_uri",
          "auth_provider_x509_cert_url",
          "client_x509_cert_url",
          "universe_domain"
        ],
        "additionalProperties": false,
        "properties": {
          "type": {
            "type": "string",
            "const": "service_account"
          },
          "project_id": {
            "type": "string",
            "minLength": 1
          },
          "private_key_id": {
            "type": "string",
            "minLength": 1
          },
          "private_key": {
            "type": "string",
            "pattern": "^-----BEGIN PRIVATE KEY-----"
          },
          "client_email": {
            "type": "string",
            "pattern": "^[^@]+@[^@]+\\.iam\\.gserviceaccount\\.com$"
          },
          "client_id": {
            "type": "string",
            "minLength": 1
          },
          "auth_uri": {
            "type": "string",
            "const": "https://accounts.google.com/o/oauth2/auth"
          },
          "token_uri": {
            "type": "string",
            "const": "https://oauth2.googleapis.com/token"
          },
          "auth_provider_x509_cert_url": {
            "type": "string",
            "const": "https://www.googleapis.com/oauth2/v1/certs"
          },
          "client_x509_cert_url": {
            "type": "string",
            "pattern": "^https://www\\.googleapis\\.com/robot/v1/metadata/x509/"
          },
          "universe_domain": {
            "type": "string",
            "const": "googleapis.com"
          }
        }
      }'
    );
  ELSIF _type = 'BUILT_IN'::public.settings_storage_type THEN
    RETURN TRUE;
  ELSE
    RAISE EXCEPTION 'type "%" is unhandled', _type;
  END IF;
END;$function$
;


