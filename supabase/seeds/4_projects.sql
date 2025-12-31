insert into projects (client_id, name) values
    ((select id from clients where name = 'Lumon Industries'), 'Macrodata Refinement'),
    ((select id from clients where name = 'Lumon Industries'), 'Wellness Protocol'),
    ((select id from clients where name = 'Lumon Industries'), 'Optics & Design'),
    ((select id from clients where name = 'Lumon Industries'), 'The Overtime Contingency'),

    ((select id from clients where name = 'Dunder Mifflin'), 'Scranton Sales Push'),
    ((select id from clients where name = 'Dunder Mifflin'), 'Annual Paper Expo'),
    ((select id from clients where name = 'Dunder Mifflin'), 'Regional Merger Plan'),

    ((select id from clients where name = 'Vandelay Industries'), 'Latex Expansion'),
    ((select id from clients where name = 'Vandelay Industries'), 'European Import Initiative'),

    ((select id from clients where name = 'Sterling Cooper'), 'Lucky Strike Campaign'),
    ((select id from clients where name = 'Sterling Cooper'), 'Mohawk Airlines Pitch'),
    ((select id from clients where name = 'Sterling Cooper'), 'Jaguar Deal'),

    ((select id from clients where name = 'Pied Piper'), 'Compression Algorithm'),
    ((select id from clients where name = 'Pied Piper'), 'Series B Pitch Deck'),
    ((select id from clients where name = 'Pied Piper'), 'Platform Launch'),

    ((select id from clients where name = 'Waystar Royco'), 'GoJo Acquisition'),
    ((select id from clients where name = 'Waystar Royco'), 'News Division Spin-Off'),
    ((select id from clients where name = 'Waystar Royco'), 'Annual Shareholder Meeting'),

    ((select id from clients where name = 'Los Pollos Hermanos'), 'Franchise Rollout'),
    ((select id from clients where name = 'Los Pollos Hermanos'), 'Supply Chain Optimization'),

    ((select id from clients where name = 'Massive Dynamic'), 'Quantum Interface Research'),
    ((select id from clients where name = 'Massive Dynamic'), 'Pattern Analysis Program'),

    ((select id from clients where name = 'Bluth Company'), 'Sudden Valley Development'),
    ((select id from clients where name = 'Bluth Company'), 'Banana Stand Expansion'),

    ((select id from clients where name = 'Wernham Hogg'), 'Quarterly Paper Sales'),
    ((select id from clients where name = 'Wernham Hogg'), 'HR Policy Revisions'),

    ((select id from clients where name = 'Oceanic Airlines'), 'Flight 815 Incident Review'),
    ((select id from clients where name = 'Oceanic Airlines'), 'Safety Compliance Initiative'),

    ((select id from clients where name = 'Buy More'), 'Black Friday Prep'),
    ((select id from clients where name = 'Buy More'), 'Nerd Herd Training'),

    ((select id from clients where name = 'Prestige Worldwide'), 'Boats and Hoes Tour'),
    ((select id from clients where name = 'Prestige Worldwide'), 'Investor Demo Tape'),

    ((select id from clients where name = 'Chartwell Pharmaceuticals'), 'Dark Army Contract'),
    ((select id from clients where name = 'Chartwell Pharmaceuticals'), 'Controlled Substance R&D'),

    ((select id from clients where name = 'Strickland Propane'), 'Propane Grill Promotion'),
    ((select id from clients where name = 'Strickland Propane'), 'Texas Safety Audit'),

    ((select id from clients where name = 'Rekall Inc.'), 'Memory Implant Catalog'),
    ((select id from clients where name = 'Rekall Inc.'), 'Neural Stability Testing'),

    ((select id from clients where name = 'E Corp'), 'Stage 2 Implementation'),
    ((select id from clients where name = 'E Corp'), 'Banking Division Upgrade'),

    ((select id from clients where name = 'Globex Corporation'), 'Hammock District'),
    ((select id from clients where name = 'Globex Corporation'), 'Cypress Creek Relocation'),

    ((select id from clients where name = 'Goliath National Bank'), 'Executive Floor Remodel'),
    ((select id from clients where name = 'Goliath National Bank'), 'Ted Mosby Building Project'),

    ((select id from clients where name = 'GreenTech'), 'Eco Initiative'),
    ((select id from clients where name = 'GreenTech'), 'Carbon Credit Management');