do
$$
    declare
        org_id uuid := '2300999D-4D91-4588-BE88-FFED0F29B90C'::uuid;
        view_only_permissions_id uuid;
    begin
        insert into public.organizations (id, display)
        values (org_id, 'Lumon Industries, Corp.');

        -- set default permissions to view-only
        select * from public.permissions p where p.organization_id = org_id and p.display = 'View-Only' limit 1 into view_only_permissions_id;
        update public.organizations set default_permissions_id = view_only_permissions_id where id = org_id;

        -- clients
        insert into public.clients (organization_id, name)
        values (org_id, 'Lumon Corp.'),
               (org_id, 'Dunder Mifflin Co.');
    end;
$$;

