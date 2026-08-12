INSERT INTO "public"."storage_providers"
("type",
 "data",
 "is_valid",
 "id",
 "created_at",
 "__is_migration_locked",
 "display")
VALUES ('GOOGLE_DRIVE',
        (select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'google_api_key')::jsonb,
        true,
        '9be98ef3-95fd-4b27-80d9-06582d669877',
        '2026-08-11 16:48:56.768813+00',
        false,
        'GDrive');