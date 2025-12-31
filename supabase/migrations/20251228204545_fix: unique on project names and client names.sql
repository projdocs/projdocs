CREATE UNIQUE INDEX clients_name_key ON public.clients USING btree (name);

CREATE UNIQUE INDEX projects_client_id_name_key ON public.projects USING btree (client_id, name);

alter table "public"."clients" add constraint "clients_name_key" UNIQUE using index "clients_name_key";

alter table "public"."projects" add constraint "projects_client_id_name_key" UNIQUE using index "projects_client_id_name_key";


