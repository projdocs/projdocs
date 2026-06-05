drop policy "select" on "public"."files";

drop policy "select" on "public"."files_versions";


create policy "crud: admin"
    on "public"."files_versions"
    as permissive
    for all
    to admin
    using (true);

create policy "crud: admin"
    on "public"."files"
    as permissive
    for all
    to admin
    using (true);


create policy "select" on public.files
    as permissive for select to authenticated
    using ((select private.check_scope_permissions('VIEW'::public.permission_levels, null, null, null,
                                                   folder_id) as can_select));

create policy "insert" on public.files
    as permissive for insert to authenticated
    with check ((select private.check_scope_permissions('EDIT'::public.permission_levels, null, null, null,
                                                        folder_id) as can_insert));

create policy "update" on public.files
    as permissive for update to authenticated
    using ((select private.check_scope_permissions('EDIT'::public.permission_levels, null, null, null,
                                                   folder_id) as can_update))
    with check ((select private.check_scope_permissions('EDIT'::public.permission_levels, null, null, null,
                                                        folder_id) as can_update));

create policy "delete" on public.files
    as permissive for delete to authenticated
    using ((select private.check_scope_permissions('DELETE'::public.permission_levels, null, null, null,
                                                   folder_id) as can_delete));

create policy "select" on public.files_versions
    as permissive for select to authenticated
    using (
    exists (select 1
            from public.files f
            where f.id = files_versions.files_id
              and private.check_scope_permissions('VIEW'::public.permission_levels, null, null, null, f.folder_id))
    );

create policy "insert" on public.files_versions
    as permissive for insert to authenticated
    with check (
    exists (select 1
            from public.files f
            where f.id = files_versions.files_id
              and private.check_scope_permissions('EDIT'::public.permission_levels, null, null, null, f.folder_id))
    );

create policy "update" on public.files_versions
    as permissive for update to authenticated
    using (
    exists (select 1
            from public.files f
            where f.id = files_versions.files_id
              and private.check_scope_permissions('EDIT'::public.permission_levels, null, null, null, f.folder_id))
    )
    with check (
    exists (select 1
            from public.files f
            where f.id = files_versions.files_id
              and private.check_scope_permissions('EDIT'::public.permission_levels, null, null, null, f.folder_id))
    );

create policy "delete" on public.files_versions
    as permissive for delete to authenticated
    using (
    exists (select 1
            from public.files f
            where f.id = files_versions.files_id
              and private.check_scope_permissions('DELETE'::public.permission_levels, null, null, null, f.folder_id))
    );