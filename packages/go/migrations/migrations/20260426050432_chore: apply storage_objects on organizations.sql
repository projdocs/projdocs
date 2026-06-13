alter table "public"."organizations" add column "folder_id" uuid;

alter table "public"."organizations" add constraint "organizations_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES public.storage_folders(id) ON UPDATE CASCADE not valid;

alter table "public"."organizations" validate constraint "organizations_folder_id_fkey";


