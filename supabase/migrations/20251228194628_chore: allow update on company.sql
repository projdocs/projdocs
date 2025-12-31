grant delete on table "public"."admins" to "postgres";

grant insert on table "public"."admins" to "postgres";

grant references on table "public"."admins" to "postgres";

grant select on table "public"."admins" to "postgres";

grant trigger on table "public"."admins" to "postgres";

grant truncate on table "public"."admins" to "postgres";

grant update on table "public"."admins" to "postgres";


  create policy "update: admins"
  on "public"."company"
  as permissive
  for update
  to authenticated
using ((auth.uid() IN ( SELECT admins.id
   FROM public.admins)));



