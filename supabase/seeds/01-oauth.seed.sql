INSERT INTO "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret",
                                             "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping",
                                             "authorization_params", "enabled", "email_optional", "issuer",
                                             "discovery_url", "skip_nonce_check", "cached_discovery",
                                             "discovery_cached_at", "authorization_url", "token_url", "userinfo_url",
                                             "jwks_uri", "created_at", "updated_at")
VALUES ('c08312ed-b5d9-48f9-8eb1-b966faa00f3e', 'oidc', 'custom:dc6c374d-51bc-434c-8edb-8f6b8c2231c6', 'Google',
        '124781446178-h5qrasikq30um1fpk7fs4a9m97cvbeg7.apps.googleusercontent.com',
        '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', ARRAY ['124781446178-h5qrasikq30um1fpk7fs4a9m97cvbeg7.apps.googleusercontent.com'], ARRAY ['openid','profile','email'], 'true', '{}', '{}', 'true',
        'false', 'https://accounts.google.com', null, 'false',
        '{
          "issuer": "https://accounts.google.com",
          "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
          "token_endpoint": "https://oauth2.googleapis.com/token",
          "scopes_supported": [
            "openid",
            "email",
            "profile"
          ],
          "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
          "grant_types_supported": [
            "authorization_code",
            "refresh_token",
            "urn:ietf:params:oauth:grant-type:device_code",
            "urn:ietf:params:oauth:grant-type:jwt-bearer"
          ],
          "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
          "subject_types_supported": [
            "public"
          ],
          "response_types_supported": [
            "code",
            "token",
            "id_token",
            "code token",
            "code id_token",
            "token id_token",
            "code token id_token",
            "none"
          ]
        }',
        '2026-04-15 17:19:21.400722+00', null, null, null, null, '2026-04-15 17:19:21.408099+00',
        '2026-04-15 17:19:21.408099+00');