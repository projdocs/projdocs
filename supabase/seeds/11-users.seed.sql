-- NRB
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at",
                            "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token",
                            "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at",
                            "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin",
                            "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change",
                            "phone_change_token", "phone_change_sent_at", "email_change_token_current",
                            "email_change_confirm_status", "banned_until", "reauthentication_token",
                            "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous")
VALUES ('00000000-0000-0000-0000-000000000000', '2b3e539a-60a2-44d5-8e33-2d1522298bd8', 'authenticated',
        'authenticated', 'me@nicholasrbarrow.com', null, '2026-04-15 18:22:50.470254+00', null, '', null, '', null, '',
        '', null, '2026-04-16 00:56:30.221415+00', '{
    "provider": "custom:dc6c374d-51bc-434c-8edb-8f6b8c2231c6",
    "providers": [
      "custom:dc6c374d-51bc-434c-8edb-8f6b8c2231c6"
    ]
  }', '{
    "iss": "https://accounts.google.com",
    "sub": "108660080613718165112",
    "name": "Nicholas Barrow",
    "email": "me@nicholasrbarrow.com",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocLoN81wvLoQbRy4opB4FqmPqSlKcnEOfnax9GcqIcPMVkwZk89u=s96-c",
    "full_name": "Nicholas Barrow",
    "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLoN81wvLoQbRy4opB4FqmPqSlKcnEOfnax9GcqIcPMVkwZk89u=s96-c",
    "provider_id": "108660080613718165112",
    "custom_claims": {
      "hd": "nicholasrbarrow.com"
    },
    "email_verified": true,
    "phone_verified": false
  }', null, '2026-04-15 18:22:50.453439+00', '2026-04-16 00:56:30.227538+00', null, null, '', '', null,
        '', '0', null, '', null, 'false', null, 'false');

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at",
                                 "updated_at", "id")
VALUES ('108660080613718165112', '2b3e539a-60a2-44d5-8e33-2d1522298bd8', '{
  "iss": "https://accounts.google.com",
  "sub": "108660080613718165112",
  "name": "Nicholas Barrow",
  "email": "me@nicholasrbarrow.com",
  "picture": "https://lh3.googleusercontent.com/a/ACg8ocLoN81wvLoQbRy4opB4FqmPqSlKcnEOfnax9GcqIcPMVkwZk89u=s96-c",
  "full_name": "Nicholas Barrow",
  "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLoN81wvLoQbRy4opB4FqmPqSlKcnEOfnax9GcqIcPMVkwZk89u=s96-c",
  "provider_id": "108660080613718165112",
  "custom_claims": {
    "hd": "nicholasrbarrow.com"
  },
  "email_verified": true,
  "phone_verified": false
}', 'custom:dc6c374d-51bc-434c-8edb-8f6b8c2231c6', '2026-04-15 18:22:50.462526+00', '2026-04-15 18:22:50.462554+00',
        '2026-04-16 00:56:29.797256+00', 'd3e7b226-2275-40f8-9a2f-a2c7cf9f09c6');

-- make NRB editor
update public.members
set permissions_id = (select p.id
                      from public.permissions p
                      where p.organization_id = '2300999D-4D91-4588-BE88-FFED0F29B90C'::uuid
                        and p.__is_default_role = true
                        and p.organization = 'DELETE'::public.permission_levels)
where user_id = '2b3e539a-60a2-44d5-8e33-2d1522298bd8'::uuid
  and permissions_id = (
    select p.id
    from public.permissions p
    where p.organization_id = '2300999D-4D91-4588-BE88-FFED0F29B90C'::uuid
      and p.__is_default_role = true
      and p.organization = 'VIEW'::public.permission_levels
    );

-- test users
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at",
                            "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token",
                            "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at",
                            "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin",
                            "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change",
                            "phone_change_token", "phone_change_sent_at", "confirmed_at", "email_change_token_current",
                            "email_change_confirm_status", "banned_until", "reauthentication_token",
                            "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous")
VALUES ('00000000-0000-0000-0000-000000000000', 'b09f7aad-62bb-484a-8851-cf383d5a2ab6', 'authenticated',
        'authenticated', 'test-user-2@example.com', '$2a$10$PcRATdTfFzC.oxq6FJS5aOCeWaON.7mkqtXtCNKW84zohwqx5Ukn.',
        '2026-05-16 15:06:36.433465+00', null, '', null, '', null, '', '', null, null, '{
    "provider": "email",
    "providers": [
      "email"
    ]
  }', '{
    "email_verified": true
  }', null, '2026-05-16 15:06:36.428553+00', '2026-05-16 15:06:36.434419+00', null, null, '', '', null,
        DEFAULT, '', 0, null, '', null, false, null, false),
       ('00000000-0000-0000-0000-000000000000', 'bc4a1775-6044-4dab-adf9-678f6daddae5', 'authenticated',
        'authenticated', 'test-user-1@examle.com', '$2a$10$Lq5X1928mqLVq6h7Kap21eHS5r/t55yDZ9pY5mkbgqxhVFvqrionS',
        '2026-05-16 15:06:24.949031+00', null, '', null, '', null, '', '', null, null, '{
         "provider": "email",
         "providers": [
           "email"
         ]
       }', '{
         "email_verified": true
       }', null, '2026-05-16 15:06:24.942487+00', '2026-05-16 15:06:24.949468+00', null, null, '', '', null,
        DEFAULT, '', 0, null, '', null, false, null, false);

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at",
                                 "updated_at", "email", "id")
VALUES ('b09f7aad-62bb-484a-8851-cf383d5a2ab6', 'b09f7aad-62bb-484a-8851-cf383d5a2ab6', '{
  "sub": "b09f7aad-62bb-484a-8851-cf383d5a2ab6",
  "email": "test-user-2@example.com",
  "email_verified": false,
  "phone_verified": false
}', 'email', '2026-05-16 15:06:36.431729+00', '2026-05-16 15:06:36.43175+00', '2026-05-16 15:06:36.43175+00',
        DEFAULT, '7f840e97-177b-4764-bbee-92bd9493f60f'),
       ('bc4a1775-6044-4dab-adf9-678f6daddae5', 'bc4a1775-6044-4dab-adf9-678f6daddae5', '{
         "sub": "bc4a1775-6044-4dab-adf9-678f6daddae5",
         "email": "test-user-1@examle.com",
         "email_verified": false,
         "phone_verified": false
       }', 'email', '2026-05-16 15:06:24.946648+00', '2026-05-16 15:06:24.946681+00', '2026-05-16 15:06:24.946681+00',
        DEFAULT, 'f77ebc26-a002-4036-87f4-c91ce4333ed7');