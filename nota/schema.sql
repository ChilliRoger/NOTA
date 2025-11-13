-- NOTA Database Schema for Neon (Postgres)
-- Run this SQL once in your Neon database to set up the required tables

CREATE TABLE elections (
  id text PRIMARY KEY,
  title text,
  data jsonb,
  closed boolean default false,
  created_by text,
  created_at timestamptz default now()
);

CREATE TABLE votes (
  id serial PRIMARY KEY,
  election_id text REFERENCES elections(id),
  email_hash text,
  vote_json jsonb,
  created_at timestamptz default now(),
  UNIQUE(election_id, email_hash)
);

-- Optional: Add indexes for faster queries
CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_elections_created_by ON elections(created_by);
CREATE INDEX idx_votes_email_hash ON votes(election_id, email_hash);
