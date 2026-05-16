do
$$
    begin
        -- client-projects

-- Lumon Industries, Inc.
        with client as (select * from public.clients where name = 'Lumon Industries, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Severed Floor Compliance Review', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Lumon Industries, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Macrodata Refinement Audit', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Dunder Mifflin Co.
        with client as (select * from public.clients where name = 'Dunder Mifflin Co.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Dunmore High School', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Dunder Mifflin Co.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Sabre Printer Recall Defense', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Dunder Mifflin Co.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Michael Scott Paper Co. Acquisition', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Weyland-Yutani Corp.
        with client as (select * from public.clients where name = 'Weyland-Yutani Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'LV-426 Salvage Rights', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Weyland-Yutani Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Prometheus Expedition Liability', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Initech Solutions LLC
        with client as (select * from public.clients where name = 'Initech Solutions LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Y2K Remediation Settlement', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Initech Solutions LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Embezzlement Fractional Rounding Matter', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Initech Solutions LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'TPS Report Compliance Program', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Vandelay Industries
        with client as (select * from public.clients where name = 'Vandelay Industries' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Latex Import Licensing', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Prestige Worldwide LLC
        with client as (select * from public.clients where name = 'Prestige Worldwide LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Boats & Hoes Marketing Campaign', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Prestige Worldwide LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Catalina Wine Mixer Permitting', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Umbrella Corporation
        with client as (select * from public.clients where name = 'Umbrella Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Raccoon City Environmental Liability', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Umbrella Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'T-Virus Patent Portfolio', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Umbrella Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Hive Facility Regulatory Response', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Gekko & Co.
        with client as (select * from public.clients where name = 'Gekko & Co.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Bluestar Airlines Takeover', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Gekko & Co.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Insider Trading SEC Response', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Bluth Company
        with client as (select * from public.clients where name = 'Bluth Company' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Sudden Valley Development', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Bluth Company' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Iraq Housing Contract Investigation', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Bluth Company' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Stair Car Asset Recovery', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Sterling Cooper Draper Pryce
        with client as (select * from public.clients where name = 'Sterling Cooper Draper Pryce' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Lucky Strike Account Retention', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Sterling Cooper Draper Pryce' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'IPO Regulatory Counsel', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Monsters, Inc.
        with client as (select * from public.clients where name = 'Monsters, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'CDA Contamination Defense', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Monsters, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Scream Energy Antitrust Review', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Cyberdyne Systems Corp.
        with client as (select * from public.clients where name = 'Cyberdyne Systems Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Skynet Development Clearances', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Cyberdyne Systems Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'T-800 Prototype Liability', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Cyberdyne Systems Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Miles Dyson Estate Matter', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Soylent Corp.
        with client as (select * from public.clients where name = 'Soylent Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'FDA Ingredient Disclosure Dispute', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Soylent Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Supply Chain Whistleblower Defense', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Pied Piper, Inc.
        with client as (select * from public.clients where name = 'Pied Piper, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Hooli Patent Litigation', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Pied Piper, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Middle-Out Compression Licensing', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Pied Piper, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Series B Term Sheet Review', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Oscorp Industries
        with client as (select * from public.clients where name = 'Oscorp Industries' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Genetic Research Regulatory Counsel', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Oscorp Industries' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Norman Osborn Estate Planning', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- InGen Corp.
        with client as (select * from public.clients where name = 'InGen Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Isla Nublar Liability Claims', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'InGen Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Dinosaur IP Portfolio', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'InGen Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Hammond Foundation Dissolution', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Globodyne Corp.
        with client as (select * from public.clients where name = 'Globodyne Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Synergy Acquisition Due Diligence', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Massive Dynamic LLC
        with client as (select * from public.clients where name = 'Massive Dynamic LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Fringe Science Ethics Review', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Massive Dynamic LLC' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Bell Estate IP Transfer', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Nakatomi Trading Corp.
        with client as (select * from public.clients where name = 'Nakatomi Trading Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Nakatomi Plaza Insurance Claim', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Nakatomi Trading Corp.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Hostage Incident Liability Defense', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Waystar Royco
        with client as (select * from public.clients where name = 'Waystar Royco' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'GoJo Acquisition Negotiation', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Waystar Royco' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Cruises Division Congressional Response', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Waystar Royco' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Logan Roy Succession Trust', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Tyrell Corporation
        with client as (select * from public.clients where name = 'Tyrell Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Replicant Patent Defense', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Tyrell Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Eldon Tyrell Estate Administration', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Rekall, Inc.
        with client as (select * from public.clients where name = 'Rekall, Inc.' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Memory Implant Product Liability', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Veridian Dynamics
        with client as (select * from public.clients where name = 'Veridian Dynamics' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Bee Weaponization Regulatory Filing', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Veridian Dynamics' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Child Labor Algorithm Audit', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Hamlin, Hamlin & McGill
        with client as (select * from public.clients where name = 'Hamlin, Hamlin & McGill' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Sandpiper Crossing Class Action', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Hamlin, Hamlin & McGill' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Chuck McGill Disability Dispute', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Hamlin, Hamlin & McGill' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Mesa Verde Expansion Counsel', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

-- Sabre Corporation
        with client as (select * from public.clients where name = 'Sabre Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Printer Fire Class Action Defense', organization_id from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;

        with client as (select * from public.clients where name = 'Sabre Corporation' limit 1),
             project
                 as (insert into public.projects (display, organization_id) select 'Dunder Mifflin Acquisition Integration', organization_id
                                                                            from client returning *)
        insert
        into public.clients_projects(client_id, project_id, organization_id)
        select client.id, project.id, project.organization_id
        from client,
             project;
    end;
$$;