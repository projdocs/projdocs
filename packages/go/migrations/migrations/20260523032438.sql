create policy "crud: admin"
  on "public"."storage_uploads"
  as permissive
  for all
  to admin
using (true);

create policy "crud: admin"
    on "public"."storage_providers"
    as permissive
    for all
    to admin
    using (true);


