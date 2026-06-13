drop policy "select" on "public"."organizations";
create policy "select"
    on "public"."organizations"
    as permissive
    for select
    to authenticated
    using ((SELECT private.is_member(organizations.id) AS is_member));



