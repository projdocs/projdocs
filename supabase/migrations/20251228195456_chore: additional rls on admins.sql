
  create policy " insert: admins (but not self)"
  on "public"."admins"
  as permissive
  for insert
  to authenticated
with check ((id <> auth.uid()));



  create policy "delete: admins (but not self)"
  on "public"."admins"
  as permissive
  for delete
  to authenticated
using ((id <> auth.uid()));



