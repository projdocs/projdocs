
  create policy "select"
  on "public"."organizations"
  as permissive
  for select
  to public
using (( SELECT public.is_member(organizations.id) AS is_member));



