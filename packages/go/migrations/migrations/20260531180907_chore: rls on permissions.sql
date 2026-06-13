
drop policy "crud: admin" on "public"."permissions";


  create policy "delete: admin"
  on "public"."permissions"
  as permissive
  for delete
  to public
using ((NOT __is_default_role));



  create policy "insert: admin"
  on "public"."permissions"
  as permissive
  for insert
  to admin
with check ((NOT __is_default_role));



  create policy "select: admin"
  on "public"."permissions"
  as permissive
  for select
  to admin
using (true);



  create policy "update: admin"
  on "public"."permissions"
  as permissive
  for update
  to admin
using ((NOT __is_default_role))
with check ((NOT __is_default_role));



