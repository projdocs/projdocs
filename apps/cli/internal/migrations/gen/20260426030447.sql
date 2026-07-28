alter table "public"."profiles" add column "profile_picture_url" text;

alter table "public"."profiles" add constraint "profiles_profile_picture_url_check" CHECK (((profile_picture_url IS NULL) OR (profile_picture_url ~ '^https?://'))) not valid;

alter table "public"."profiles" validate constraint "profiles_profile_picture_url_check";


