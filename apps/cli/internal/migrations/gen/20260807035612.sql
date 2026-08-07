create sequence "private"."org_9d959604de054f4f8a5341c89bceab4c_client_sequence";

create sequence "private"."org_9d959604de054f4f8a5341c89bceab4c_file_sequence";

create sequence "private"."org_9d959604de054f4f8a5341c89bceab4c_project_sequence";

drop trigger if exists "before_actions" on "public"."clients_projects";

drop policy "crud: admin" on "public"."clients_projects";

drop policy "delete" on "public"."clients_projects";

drop policy "insert" on "public"."clients_projects";

drop policy "select" on "public"."clients_projects";

drop policy "update" on "public"."clients_projects";

revoke delete on table "public"."clients_projects" from "anon";

revoke insert on table "public"."clients_projects" from "anon";

revoke references on table "public"."clients_projects" from "anon";

revoke select on table "public"."clients_projects" from "anon";

revoke trigger on table "public"."clients_projects" from "anon";

revoke truncate on table "public"."clients_projects" from "anon";

revoke update on table "public"."clients_projects" from "anon";

revoke delete on table "public"."clients_projects" from "authenticated";

revoke insert on table "public"."clients_projects" from "authenticated";

revoke references on table "public"."clients_projects" from "authenticated";

revoke select on table "public"."clients_projects" from "authenticated";

revoke trigger on table "public"."clients_projects" from "authenticated";

revoke truncate on table "public"."clients_projects" from "authenticated";

revoke update on table "public"."clients_projects" from "authenticated";

revoke delete on table "public"."clients_projects" from "service_role";

revoke insert on table "public"."clients_projects" from "service_role";

revoke references on table "public"."clients_projects" from "service_role";

revoke select on table "public"."clients_projects" from "service_role";

revoke trigger on table "public"."clients_projects" from "service_role";

revoke truncate on table "public"."clients_projects" from "service_role";

revoke update on table "public"."clients_projects" from "service_role";

alter table "public"."clients_projects" drop constraint "clients_projects_client_id_fkey";

alter table "public"."clients_projects" drop constraint "clients_projects_client_id_project_id_organization_id_key";

alter table "public"."clients_projects" drop constraint "clients_projects_organization_id_fkey";

alter table "public"."clients_projects" drop constraint "clients_projects_project_id_fkey";

alter table "public"."projects" drop constraint "projects_client_id_fkey";

alter table "public"."clients_projects" drop constraint "client_projects_pkey";

drop index if exists "public"."client_projects_pkey";

drop index if exists "public"."clients_projects_client_id_project_id_organization_id_key";

drop table "public"."clients_projects";

alter table "public"."projects" drop column "client_id";


