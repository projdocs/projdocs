create policy "insert"
    on "public"."clients"
    as permissive
    for insert
    to authenticated
    with check ((select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                            id) as can));

create policy "update"
    on "public"."clients"
    as permissive
    for update
    to authenticated
    using ((select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                            id) as can));

create policy "delete"
    on "public"."clients"
    as permissive
    for delete
    to authenticated
    using ((select private.can_current_user('DELETE'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                            id) as can));

create policy "insert"
    on "public"."projects"
    as permissive
    for insert
    to authenticated
    with check ((select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            id) as can));

create policy "update"
    on "public"."projects"
    as permissive
    for update
    to authenticated
    using ((select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            id) as can));

create policy "delete"
    on "public"."projects"
    as permissive
    for delete
    to authenticated
    using ((select private.can_current_user('DELETE'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            id) as can));

create policy "insert"
    on "public"."clients_projects"
    as permissive
    for insert
    to authenticated
    with check ((select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            project_id) as can_projects) and (select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                                                                                                   client_id) as can_clients));
create policy "update"
    on "public"."clients_projects"
    as permissive
    for update
    to authenticated
    using ((select private.can_current_user('EDIT'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            project_id) as can_projects) and (select private.can_current_user('EDIT'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                                                                                                   client_id) as can_clients));
create policy "delete"
    on "public"."clients_projects"
    as permissive
    for delete
    to authenticated
    using ((select private.can_current_user('DELETE'::public.permission_levels, 'PROJECTS'::public.permission_scopes,
                                            project_id) as can_projects) and (select private.can_current_user('DELETE'::public.permission_levels, 'CLIENTS'::public.permission_scopes,
                                                                                                          client_id) as can_clients));
