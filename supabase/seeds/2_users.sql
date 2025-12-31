DO $$
BEGIN

  CREATE OR REPLACE FUNCTION __seed_user(fn text, ln text, email text)
  RETURNS void AS $f$
  DECLARE
    uid uuid := gen_random_uuid();
  BEGIN
    -- Insert into auth.users
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
      crypt('password123', gen_salt('bf')),
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

    -- Insert into auth.identities
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

    -- Insert public.users
    insert into public.users (id, first_name, last_name) values (uid, fn, ln);
  END;
  $f$ LANGUAGE plpgsql;

  -- Seed users
  PERFORM __seed_user('Harvey', 'Specter', 'harvey@pearsonspecter.com');
  INSERT INTO public.admins (id) values ((select id from auth.users a where a.email = 'harvey@pearsonspecter.com' limit 1));

  PERFORM __seed_user('Mike', 'Ross', 'mike@pearsonspecter.com');
  PERFORM __seed_user('Jessica', 'Pearson', 'jessica@pearsonspecter.com');
  PERFORM __seed_user('Louis', 'Litt', 'louis@pearsonspecter.com');
  PERFORM __seed_user('Rachel', 'Zane', 'rachel@pearsonspecter.com');
  PERFORM __seed_user('Donna', 'Paulsen', 'donna@pearsonspecter.com');
  PERFORM __seed_user('Katrina', 'Bennett', 'katrina@pearsonspecter.com');
  PERFORM __seed_user('Robert', 'Zane', 'robert@zanelaw.com');
  PERFORM __seed_user('Sheila', 'Sazs', 'sheila@columbia.edu');
  PERFORM __seed_user('Daniel', 'Hardman', 'daniel@pearsonhardman.com');
  PERFORM __seed_user('Alex', 'Williams', 'alex@zanespecterlitt.com');
  PERFORM __seed_user('Samantha', 'Wheeler', 'samantha@zanespecterlitt.com');
  PERFORM __seed_user('Gretchen', 'Bodinski', 'gretchen@pearsonspecter.com');
  PERFORM __seed_user('Brian', 'Altman', 'brian@pearsonspecter.com');

  -- Clean up
  DROP FUNCTION __seed_user(text, text, text);

END;
$$;