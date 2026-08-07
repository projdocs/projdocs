alter table "public"."projects" add column "client_id" uuid not null;

alter table "public"."projects" add constraint "projects_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients_projects(id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED not valid;

alter table "public"."projects" validate constraint "projects_client_id_fkey";
