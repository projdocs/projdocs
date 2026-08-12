create type public.hashing_algorithm as enum (
    'md5',
    'sha256'
    );

create type public.checksum as
(
    algorithm public.hashing_algorithm,
    hash      text
);

alter table public.storage_uploads
    drop column checksum,
    add column checksum public.checksum,
    add constraint checksum_required_with_file_version
        check (file_version_id is null or checksum is not null);