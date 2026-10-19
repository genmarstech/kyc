DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality   TEXT NOT NULL,
  address       TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  id_number     TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE qr_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'claimed', 'expired')),

    claim_token_hash TEXT NOT NULL UNIQUE,
    poll_token_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    claimed_at TIMESTAMPTZ
);

CREATE INDEX idx_qr_sessions_expiry
    ON qr_sessions (expires_at)
    WHERE status = 'pending';