-- explicitly disallow member creation for ghost
alter table "public"."members" add constraint "members_user_id_check" CHECK ((user_id <> '095e3b93-603f-46e0-a6ce-c200f1be1995'::uuid)) not valid;
alter table "public"."members" validate constraint "members_user_id_check";

do
$$
    declare
        _uid uuid := '095E3B93-603F-46E0-A6CE-C200F1BE1995'::uuid; -- make static
    begin
        insert into auth.users ("instance_id",
                                "id",
                                "aud",
                                "role",
                                "email",
                                "encrypted_password",
                                "email_confirmed_at",
                                "invited_at",
                                "confirmation_token",
                                "confirmation_sent_at",
                                "recovery_token",
                                "recovery_sent_at",
                                "email_change_token_new",
                                "email_change",
                                "email_change_sent_at",
                                "last_sign_in_at",
                                "raw_app_meta_data",
                                "raw_user_meta_data",
                                "is_super_admin",
                                "created_at",
                                "updated_at",
                                "phone",
                                "phone_confirmed_at",
                                "phone_change",
                                "phone_change_token",
                                "phone_change_sent_at",
                                "email_change_token_current",
                                "email_change_confirm_status",
                                "banned_until",
                                "reauthentication_token",
                                "reauthentication_sent_at",
                                "is_sso_user",
                                "deleted_at",
                                "is_anonymous")
        values ('00000000-0000-0000-0000-000000000000',
                _uid,
                'supabase_read_only_user',
                'supabase_read_only_user',
                'ghost@localhost',
                null,
                current_timestamp,
                null,
                '',
                null,
                '',
                null,
                '',
                '',
                null,
                null,
                '{
                  "provider": "email",
                  "providers": [
                    "email"
                  ]
                }',
                '{
                  "email_verified": true,
                  "full_name": "Ghost (Deleted User)"
                }',
                null,
                current_timestamp,
                current_timestamp,
                null,
                null,
                '',
                '',
                null,
                '',
                0,
                null,
                '',
                null,
                false,
                null,
                false);

        insert into auth.identities ("provider_id",
                                     "user_id",
                                     "identity_data",
                                     "provider",
                                     "last_sign_in_at",
                                     "created_at",
                                     "updated_at",
                                     "id")
        values (_uid,
                _uid,
                jsonb_build_object(
                        'sub', _uid,
                        'email', 'ghost@localhost',
                        'email_verified', false,
                        'phone_verified', false
                ),
                'email',
                current_timestamp,
                current_timestamp,
                current_timestamp,
                gen_random_uuid());
    end;
$$;
