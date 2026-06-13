drop policy "select: own" on "public"."members";
create policy "select: own"
    on "public"."members"
    as permissive
    for select
    to authenticated, admin
    using ((user_id = (SELECT auth.uid() AS uid)));

drop policy "select" on "public"."profiles";
create policy "select"
    on "public"."profiles"
    as permissive
    for select
    to authenticated, admin
    using ((SELECT private.can_current_user('VIEW'::public.permission_levels, 'ORGANIZATION'::public.permission_scopes,
                                            profiles.organization_id) AS can_select));

drop policy "crud: self" on "public"."favorites";
create policy "crud: self"
    on "public"."favorites"
    as permissive
    for all
    to authenticated, admin
    using (((SELECT auth.uid() AS _uid) = user_id))
    with check (((SELECT auth.uid() AS _uid) = user_id));