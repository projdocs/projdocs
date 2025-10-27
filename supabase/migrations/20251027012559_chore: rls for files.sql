drop policy "Enable insert for authenticated users only" on "public"."files";

drop policy "Enable select for authenticated users only" on "public"."files";

alter table "public"."files" add column "project_id" uuid not null;

alter table "public"."files" add constraint "files_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."files" validate constraint "files_project_id_fkey";

create policy "Delete files based on projects access"
on "public"."files"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = files.project_id) AND ((projects.access = ANY (ARRAY['DELETE'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['DELETE'::access, 'ADMIN'::access]))))))))));


create policy "Insert files based on projects access"
on "public"."files"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = files.project_id) AND ((projects.access = ANY (ARRAY['EDIT'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))));


create policy "Select files based on projects access"
on "public"."files"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = files.project_id) AND ((projects.access = ANY (ARRAY['READ'::access, 'EDIT'::access, 'DELETE'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['READ'::access, 'EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))));


create policy "Update files based on projects access"
on "public"."files"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = files.project_id) AND ((projects.access = ANY (ARRAY['EDIT'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))))
with check ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = files.project_id) AND ((projects.access = ANY (ARRAY['EDIT'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))));



