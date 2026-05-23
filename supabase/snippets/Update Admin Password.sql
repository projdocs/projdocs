WITH pwd AS (
    SELECT gen_random_uuid()::text AS raw
),
updated AS (
    UPDATE auth.users
    SET encrypted_password = extensions.crypt((SELECT raw FROM pwd), extensions.gen_salt('bf', 12))
    WHERE email = 'admin@projdocs.localhost'
    RETURNING id
)
SELECT pwd.raw FROM pwd, updated;