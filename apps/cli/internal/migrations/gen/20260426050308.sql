revoke delete on table "public"."storage_links" from "anon";

revoke insert on table "public"."storage_links" from "anon";

revoke references on table "public"."storage_links" from "anon";

revoke select on table "public"."storage_links" from "anon";

revoke trigger on table "public"."storage_links" from "anon";

revoke truncate on table "public"."storage_links" from "anon";

revoke update on table "public"."storage_links" from "anon";

revoke delete on table "public"."storage_links" from "authenticated";

revoke insert on table "public"."storage_links" from "authenticated";

revoke references on table "public"."storage_links" from "authenticated";

revoke select on table "public"."storage_links" from "authenticated";

revoke trigger on table "public"."storage_links" from "authenticated";

revoke truncate on table "public"."storage_links" from "authenticated";

revoke update on table "public"."storage_links" from "authenticated";

revoke delete on table "public"."storage_links" from "service_role";

revoke insert on table "public"."storage_links" from "service_role";

revoke references on table "public"."storage_links" from "service_role";

revoke select on table "public"."storage_links" from "service_role";

revoke trigger on table "public"."storage_links" from "service_role";

revoke truncate on table "public"."storage_links" from "service_role";

revoke update on table "public"."storage_links" from "service_role";

alter table "public"."organizations" drop constraint "organizations_storage_link_fkey";

alter table "public"."storage_links" drop constraint "storage_link_storage_provider_id_fkey";

alter table "public"."storage_links" drop constraint "storage_link_pkey";

drop index if exists "public"."storage_link_pkey";

drop table "public"."storage_links";

alter table "public"."organizations" drop column "storage_link_id";


