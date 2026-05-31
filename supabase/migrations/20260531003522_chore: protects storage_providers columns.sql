alter table public.storage_providers add column display text not null unique default 'Default/Built-In';

REVOKE SELECT ON TABLE public.storage_providers FROM public;
REVOKE SELECT ON TABLE public.storage_providers FROM admin;
REVOKE SELECT ON TABLE public.storage_providers FROM authenticated;
REVOKE SELECT ON TABLE public.storage_providers FROM anon;
REVOKE SELECT ON TABLE public.storage_providers FROM service_role;

GRANT SELECT (id, display, type, is_valid, created_at, __is_migration_locked) ON public.storage_providers TO admin, service_role;