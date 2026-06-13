DO
$$
    BEGIN
        IF NOT EXISTS(SELECT *
                          FROM public.storage_providers sp
                          WHERE sp.type = 'BUILT_IN'::public.settings_storage_type)
        THEN
            INSERT INTO public.storage_providers (type) values ('BUILT_IN'::public.settings_storage_type);
        END IF;
    END;
$$;