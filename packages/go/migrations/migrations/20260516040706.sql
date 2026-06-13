create schema admin;
grant execute on all functions in schema admin to admin;
alter function public.get_user_count set schema admin;