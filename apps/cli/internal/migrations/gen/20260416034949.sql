
  create policy "select"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (( SELECT public.is_member(profiles.organization_id) AS is_member));



