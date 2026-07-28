alter type public.settings_storage_type add value 'BUILT_IN';
commit;
alter table public.settings_storage alter column type set default 'BUILT_IN'::public.settings_storage_type;