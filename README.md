# projdocs

An open-source Document Management System (DMS).

## Configuration

### Environment Variables

### `ENABLE_PROJDOCS_ADMIN`
- Accepts: `1` | `any`
- Description: Whether to enable the admin portal on the `/admin` endpoint (https://your-projdocs-url.local/admin)

### `PROJDOCS_VERSION`
- Accepts: `any`
- Description: the build-version of ProjDocs

### `SUPABASE_KONG_URL`
- Accepts: `URL` (FQDN)
- Description: the FQDN address to a Supabase Kong gateway (e.g., `http://127.0.0.1:54321`)

### `SUPABASE_PUBLISHABLE_KEY`
- Accepts: `sb_publishable_[...]`
- Description: a Supabase publishable API key (e.g., `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`)

### `SUPABASE_SECRET_KEY`
- Accepts: `sb_secret_[...]`
- Description: a Supabase secret API key (e.g., `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`)

### `SUPABASE_S3_ACCESS_KEY_ID`
- Description: access key for built-in S3

### `SUPABASE_S3_SECRET_KEY`
- Description: secret key for built-in S3

