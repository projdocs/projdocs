do
$$
    declare
        org_id uuid := gen_random_uuid();
        nrb_id uuid := '2b3e539a-60a2-44d5-8e33-2d1522298bd8'::uuid;
    begin
        insert into public.organizations (id, display)
        values (org_id, 'Lumon Industries, Corp.');

        insert into public.members(user_id, organization_id)
        values (nrb_id, org_id);
    end;
$$;

