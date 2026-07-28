drop policy "select" on "public"."files";
create policy "select"
    on "public"."files"
    as permissive
    for select
    to authenticated, admin
    using ((SELECT (EXISTS (SELECT f.id
                            FROM public.folders f
                            WHERE (f.id = public.files.folder_id))) AS can_view_folder));

create policy "select"
    on "public"."files_versions"
    as permissive
    for select
    to authenticated, admin
    using ((SELECT (EXISTS (SELECT f.id
                            FROM public.files f
                            WHERE (f.id = public.files_versions.files_id))) AS can_view_folder));

