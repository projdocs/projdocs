CREATE TABLE public.favorites
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    client_id  UUID NULL REFERENCES public.clients (id) ON UPDATE CASCADE ON DELETE CASCADE,
    project_id UUID NULL REFERENCES public.projects (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT favorites_exactly_one_fk CHECK (
        (client_id IS NOT NULL AND project_id IS NULL)
            OR
        (client_id IS NULL AND project_id IS NOT NULL)
        )
);

CREATE UNIQUE INDEX favorites_user_client_project_unique
    ON public.favorites (
                         user_id,
                         COALESCE(client_id, '00000000-0000-0000-0000-000000000000'),
                         COALESCE(project_id, '00000000-0000-0000-0000-000000000000')
        );

ALTER TABLE public.favorites
    ENABLE ROW LEVEL SECURITY;

create policy "crud: self"
    on "public"."favorites"
    as permissive
    for all
    to authenticated
    using (((SELECT auth.uid() AS _uid) = user_id))
    with check (((SELECT auth.uid() AS _uid) = user_id));

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION triggers.favorites_before_actions()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET SEARCH_PATH = ''
AS
$function$
begin
    if tg_op = 'INSERT' then
        NEW.user_id := auth.uid();
    elsif tg_op = 'UPDATE' then
        NEW.user_id := OLD.user_id;
    else -- DELETE

    end if;
    return coalesce(new, old);
end;
$function$
;


CREATE TRIGGER before_actions
    BEFORE INSERT OR DELETE OR UPDATE
    ON public.favorites
    FOR EACH ROW
EXECUTE FUNCTION triggers.favorites_before_actions();
