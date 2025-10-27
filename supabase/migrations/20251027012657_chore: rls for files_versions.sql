drop
policy "Enable insert for authenticated users only" on "public"."files_versions";

drop
policy "Enable select for authenticated users only" on "public"."files_versions";

create
policy "Delete files_versions based on projects access"
on "public"."files_versions"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = (
        SELECT f.project_id FROM files f WHERE f.id = files_versions.file_id
  )) AND ((projects.access = ANY (ARRAY['DELETE'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['DELETE'::access, 'ADMIN'::access]))))))))));


create
policy "Insert files_versions based on projects access"
on "public"."files_versions"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = (
        SELECT f.project_id FROM files f WHERE f.id = files_versions.file_id
  )) AND ((projects.access = ANY (ARRAY['EDIT'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
           FROM permissions p
          WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))));


create
policy "Select files_versions based on projects access"
on "public"."files_versions"
as permissive
for
select
    to authenticated
    using ((EXISTS ( SELECT 1
    FROM projects
    WHERE ((projects.id = (
    SELECT f.project_id FROM files f WHERE f.id = files_versions.file_id
    )) AND ((projects.access = ANY (ARRAY['READ'::access, 'EDIT'::access, 'DELETE'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
    FROM permissions p
    WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['READ'::access, 'EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))));


create
policy "Update files_versions based on projects access"
on "public"."files_versions"
as permissive
for
update
    to authenticated
    using ((EXISTS ( SELECT 1
    FROM projects
    WHERE ((projects.id = (
    SELECT f.project_id FROM files f WHERE f.id = files_versions.file_id
    )) AND ((projects.access = ANY (ARRAY['EDIT'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
    FROM permissions p
    WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))))
with check ((EXISTS ( SELECT 1
    FROM projects
    WHERE ((projects.id = (
    SELECT f.project_id FROM files f WHERE f.id = files_versions.file_id
    )) AND ((projects.access = ANY (ARRAY['EDIT'::access, 'ADMIN'::access])) OR (EXISTS ( SELECT 1
    FROM permissions p
    WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.project_id = projects.id) AND (p.level = ANY (ARRAY['EDIT'::access, 'DELETE'::access, 'ADMIN'::access]))))))))));



