alter table "public"."projects" alter column "name" set data type public.display using "name"::public.display;


