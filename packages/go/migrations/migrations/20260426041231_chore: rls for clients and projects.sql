create policy "select"
    on "public"."clients"
    as permissive
    for select
    to authenticated
    using ((SELECT public.is_member(clients.organization_id) AS is_member));

create policy "select"
    on "public"."projects"
    as permissive
    for select
    to authenticated
    using ((SELECT public.is_member(projects.organization_id) AS is_member));



