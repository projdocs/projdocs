set check_function_bodies = off;

CREATE OR REPLACE FUNCTION triggers.profiles_before_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin

  if tg_op = 'DELETE' then

    if (
      0 < (
        select count(*) from public.members m where m.organization_id = OLD.organization_id and m.user_id = OLD.user_id
      )
    ) then
      raise exception 'cannot delete a profile before deleting its corresponding row in `members`';
    end if;

  end if;

  return coalesce(old, new);

end;$function$
;

CREATE TRIGGER before_actions BEFORE INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION triggers.profiles_before_actions();


