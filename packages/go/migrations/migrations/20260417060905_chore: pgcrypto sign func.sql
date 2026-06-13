CREATE OR REPLACE FUNCTION extensions.sign_rs256(
    payload json,
    private_key text
)
    RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    header_b64    text;
    payload_b64   text;
    signable      text;
    signature_b64 text;
BEGIN
    header_b64  := translate(encode(convert_to('{"alg":"RS256","typ":"JWT"}', 'utf8'), 'base64'), E'+/=\n', '-_');
    payload_b64 := translate(encode(convert_to(payload::text, 'utf8'), 'base64'), E'+/=\n', '-_');
    signable    := header_b64 || '.' || payload_b64;

    signature_b64 := translate(
            encode(
                    extensions.sign(
                            signable::bytea,
                            decode(
                                    replace(replace(replace(replace(replace(
                                                                            private_key,
                                                                            '-----BEGIN PRIVATE KEY-----', ''),
                                                                    '-----END PRIVATE KEY-----', ''),
                                                            '-----BEGIN RSA PRIVATE KEY-----', ''),
                                                    '-----END RSA PRIVATE KEY-----', ''),
                                            E'\n', ''),
                                    'base64'
                            ),
                            'sha256withrsaencryption'
                    ),
                    'base64'
            ),
            E'+/=\n', '-_'
                     );

    RETURN signable || '.' || signature_b64;
END;
$$;