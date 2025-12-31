CREATE DOMAIN DISPLAY AS text
    CHECK (
        value ~ '^[A-Za-z0-9][A-Za-z0-9 ,.&\-]{1,}[A-Za-z0-9.]$'
        );