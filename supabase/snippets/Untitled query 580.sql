INSERT INTO storage.buckets ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection",
                              "file_size_limit", "allowed_mime_types", "owner_id", "type")
VALUES ('projdocs', 'projdocs', null, current_timestamp, current_timestamp, false, false,
        null, null, null, 'STANDARD');