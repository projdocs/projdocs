do
$$
    declare
        org_id uuid := '2300999D-4D91-4588-BE88-FFED0F29B90C'::uuid;
    begin
        insert into public.organizations (id, display, auto_add_members)
        values (org_id, 'Lumon Industries, Corp.', true);

        -- clients
        insert into public.clients (organization_id, name)
        values (org_id, 'Lumon Corp.'),
               (org_id, 'Dunder Mifflin Co.');
    end;
$$;

