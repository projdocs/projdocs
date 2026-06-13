
revoke delete on table "public"."storage_folders" from "anon";

revoke insert on table "public"."storage_folders" from "anon";

revoke references on table "public"."storage_folders" from "anon";

revoke select on table "public"."storage_folders" from "anon";

revoke trigger on table "public"."storage_folders" from "anon";

revoke truncate on table "public"."storage_folders" from "anon";

revoke update on table "public"."storage_folders" from "anon";

revoke delete on table "public"."storage_folders" from "authenticated";

revoke insert on table "public"."storage_folders" from "authenticated";

revoke references on table "public"."storage_folders" from "authenticated";

revoke select on table "public"."storage_folders" from "authenticated";

revoke trigger on table "public"."storage_folders" from "authenticated";

revoke truncate on table "public"."storage_folders" from "authenticated";

revoke update on table "public"."storage_folders" from "authenticated";

revoke delete on table "public"."storage_folders" from "service_role";

revoke insert on table "public"."storage_folders" from "service_role";

revoke references on table "public"."storage_folders" from "service_role";

revoke select on table "public"."storage_folders" from "service_role";

revoke trigger on table "public"."storage_folders" from "service_role";

revoke truncate on table "public"."storage_folders" from "service_role";

revoke update on table "public"."storage_folders" from "service_role";

alter table "public"."organizations" drop constraint "organizations_folder_id_fkey";

alter table "public"."storage_folders" drop constraint "storage_objects_parent_id_fkey";

alter table "public"."storage_folders" drop constraint "storage_objects_storage_provider_id_fkey";

alter table "public"."storage_folders" drop constraint "storage_objects_pkey";

drop index if exists "public"."storage_objects_pkey";

drop table "public"."storage_folders";


