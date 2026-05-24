create policy "crud: admin"
    on "public"."folders"
    as permissive
    for all
    to admin
    using (true);
