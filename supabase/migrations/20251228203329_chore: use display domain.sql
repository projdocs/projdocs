alter table "public"."company" alter column "name" set default NULL::text;

alter table "public"."company" alter column "name" set data type public.display using "name"::public.display;

alter table "public"."users" drop column "full_name";

alter table "public"."users" alter column "first_name" set default NULL::text;

alter table "public"."users" alter column "first_name" set data type public.display using "first_name"::public.display;

alter table "public"."users" alter column "last_name" set default NULL::text;

alter table "public"."users" alter column "last_name" set data type public.display using "last_name"::public.display;

alter table public.users add column full_name text generated always as ((first_name || ' '::text) || last_name) stored;



