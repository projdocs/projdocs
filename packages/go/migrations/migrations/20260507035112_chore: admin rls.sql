create policy "crud: admin"
    on "public"."permissions"
    as permissive
    for all
    to admin
    using (not __is_default_role);

create policy "crud: admin"
    on "public"."organizations"
    as permissive
    for all
    to admin
    using (true);



