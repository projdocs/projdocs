alter table public.storage_uploads
    drop column checksum;

alter table public.storage_uploads
    add column checksum public.checksum;