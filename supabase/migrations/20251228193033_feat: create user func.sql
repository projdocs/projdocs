alter table "public"."company" add column "is_setup" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_user(fn text, ln text, email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  uid uuid := gen_random_uuid();
  pwd text := replace(gen_random_uuid()::text, '-', '');
BEGIN

  -- create auth.user
  insert into auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at, confirmation_sent_at,
      is_sso_user, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    )
    values (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      email,
      crypt(pwd, gen_salt('bf')),
      current_timestamp,
      current_timestamp,
      false,
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('first_name', fn, 'last_name', ln, 'full_name', fn || ' ' || ln),
      current_timestamp,
      current_timestamp,
      '',
      '',
      '',
      ''
    );

  -- create auth.identity
  insert into auth.identities (
      id, user_id, provider_id, identity_data,
      provider, last_sign_in_at, created_at, updated_at
    )
    values (
      uuid_generate_v4(),
      uid,
      uid,
      jsonb_build_object('sub', uid::text, 'email', email),
      'email',
      current_timestamp,
      current_timestamp,
      current_timestamp
    );

  -- insert public.user
  insert into public.users (id, first_name, last_name) values (uid, fn, ln);

  -- done
  return uid;
END;$function$
;


