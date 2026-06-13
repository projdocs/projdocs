create policy "crud: admin"
    on "public"."clients_projects"
    as permissive
    for all
    to admin
    using (true);

create policy "crud: admin"
    on "public"."clients"
    as permissive
    for all
    to admin
    using (true);

create policy "crud: admin"
    on "public"."projects"
    as permissive
    for all
    to admin
    using (true);

create policy "crud: admin"
    on "public"."folders"
    as permissive
    for all
    to admin
    using (true);



