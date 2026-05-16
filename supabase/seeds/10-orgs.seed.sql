do
$$
    declare
        org_id                   uuid := '2300999D-4D91-4588-BE88-FFED0F29B90C'::uuid;
        view_only_permissions_id uuid;
    begin
        insert into public.organizations (id, display)
        values (org_id, 'NRB Co.');

        -- set default permissions to view-only
        select *
        from public.permissions p
        where p.organization_id = org_id
          and p.display = 'View-Only'
        limit 1
        into view_only_permissions_id;
        update public.organizations set default_permissions_id = view_only_permissions_id where id = org_id;

        -- clients
        insert into public.clients (organization_id, name)
        values (org_id, 'Lumon Industries, Inc.'),
               (org_id, 'Dunder Mifflin Co.'),
               (org_id, 'Weyland-Yutani Corp.'),
               (org_id, 'Initech Solutions LLC'),
               (org_id, 'Vandelay Industries'),
               (org_id, 'Prestige Worldwide LLC'),
               (org_id, 'Umbrella Corporation'),
               (org_id, 'Gekko & Co.'),
               (org_id, 'Bluth Company'),
               (org_id, 'Sterling Cooper Draper Pryce'),
               (org_id, 'Monsters, Inc.'),
               (org_id, 'Cyberdyne Systems Corp.'),
               (org_id, 'Soylent Corp.'),
               (org_id, 'Pied Piper, Inc.'),
               (org_id, 'Oscorp Industries'),
               (org_id, 'InGen Corp.'),
               (org_id, 'Globodyne Corp.'),
               (org_id, 'Massive Dynamic LLC'),
               (org_id, 'Nakatomi Trading Corp.'),
               (org_id, 'Waystar Royco'),
               (org_id, 'Tyrell Corporation'),
               (org_id, 'Rekall, Inc.'),
               (org_id, 'Veridian Dynamics'),
               (org_id, 'Hamlin, Hamlin & McGill'),
               (org_id, 'Sabre Corporation');

        -- projects
        insert into public.projects (display, organization_id) values ('Admin', org_id), ('Accounting', org_id);
    end;
$$;

-- seed not-use organizations
do
$$
    begin
        insert into public.organizations(display) values ('Pearson Specter LLP');
    end;
$$;
