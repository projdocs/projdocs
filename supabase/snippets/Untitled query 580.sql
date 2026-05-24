SELECT conname, condeferrable, condeferred
FROM pg_constraint
WHERE conname = 'storage_uploads_client_id_fkey';