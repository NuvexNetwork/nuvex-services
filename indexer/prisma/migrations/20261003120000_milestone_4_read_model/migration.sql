-- Milestone 4 read model. Chain accounts remain authoritative.

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  authority TEXT NOT NULL,
  operator TEXT NOT NULL,
  vrf_pubkey TEXT,
  stake_lamports BIGINT NOT NULL DEFAULT 0,
  job_mask INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  reputation BIGINT NOT NULL DEFAULT 0,
  created_slot BIGINT NOT NULL,
  last_heartbeat BIGINT,
  cooldown_end_slot BIGINT,
  updated_slot BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS nodes_authority_idx ON nodes (authority);
CREATE INDEX IF NOT EXISTS nodes_status_idx ON nodes (status);

CREATE TABLE IF NOT EXISTS node_events (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES nodes (id),
  slot BIGINT NOT NULL,
  signature TEXT NOT NULL,
  kind TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS node_events_node_slot_idx ON node_events (node_id, slot);
CREATE INDEX IF NOT EXISTS node_events_signature_idx ON node_events (signature);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  requester TEXT NOT NULL,
  callback TEXT,
  max_fee BIGINT NOT NULL DEFAULT 0,
  created_slot BIGINT NOT NULL,
  expires_slot BIGINT NOT NULL DEFAULT 0,
  assigned_node TEXT,
  assigned_stake BIGINT,
  assigned_heartbeat BIGINT,
  updated_slot BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS requests_status_updated_idx ON requests (status, updated_slot);
CREATE INDEX IF NOT EXISTS requests_job_type_idx ON requests (job_type);
CREATE INDEX IF NOT EXISTS requests_requester_idx ON requests (requester);

CREATE TABLE IF NOT EXISTS request_events (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests (id),
  slot BIGINT NOT NULL,
  signature TEXT NOT NULL,
  kind TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS request_events_request_slot_idx ON request_events (request_id, slot);
CREATE INDEX IF NOT EXISTS request_events_signature_idx ON request_events (signature);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL UNIQUE,
  fee_lamports BIGINT NOT NULL,
  timeout_slots BIGINT NOT NULL,
  quorum INTEGER NOT NULL,
  updated_slot BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE REFERENCES requests (id),
  slot BIGINT NOT NULL,
  commitment TEXT NOT NULL,
  node_id TEXT,
  output_hex TEXT
);
CREATE INDEX IF NOT EXISTS results_slot_idx ON results (slot);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE REFERENCES requests (id),
  status TEXT NOT NULL,
  slot BIGINT NOT NULL,
  node_id TEXT,
  output_hex TEXT
);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON verifications (status);

CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  challenger TEXT NOT NULL,
  status TEXT NOT NULL,
  slot BIGINT NOT NULL,
  UNIQUE (request_id, challenger)
);
CREATE INDEX IF NOT EXISTS challenges_status_idx ON challenges (status);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  lamports BIGINT NOT NULL,
  slot BIGINT NOT NULL,
  signature TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS rewards_recipient_slot_idx ON rewards (recipient, slot);
CREATE INDEX IF NOT EXISTS rewards_signature_idx ON rewards (signature);

CREATE TABLE IF NOT EXISTS transactions (
  signature TEXT PRIMARY KEY,
  slot BIGINT NOT NULL,
  success BOOLEAN NOT NULL,
  program_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS transactions_slot_idx ON transactions (slot);
CREATE INDEX IF NOT EXISTS transactions_program_id_idx ON transactions (program_id);

CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS model_versions (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models (id),
  digest TEXT NOT NULL,
  created_slot BIGINT NOT NULL,
  UNIQUE (model_id, digest)
);

CREATE TABLE IF NOT EXISTS price_observations (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  source TEXT NOT NULL,
  price DECIMAL(38, 18) NOT NULL,
  slot BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS price_observations_symbol_slot_idx ON price_observations (symbol, slot);

CREATE TABLE IF NOT EXISTS network_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot BIGINT NOT NULL,
  value DECIMAL(38, 18) NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS network_metrics_name_slot_idx ON network_metrics (name, slot);

CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  last_processed_slot BIGINT,
  last_processed_signature TEXT,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS registry (
  id TEXT PRIMARY KEY,
  authority TEXT NOT NULL,
  node_count BIGINT NOT NULL,
  min_stake BIGINT NOT NULL,
  unstake_cooldown_slots BIGINT NOT NULL,
  heartbeat_timeout_slots BIGINT NOT NULL,
  slash_authority TEXT,
  slash_destination TEXT,
  updated_slot BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS protocol (
  id TEXT PRIMARY KEY,
  authority TEXT NOT NULL,
  paused BOOLEAN NOT NULL,
  updated_slot BIGINT NOT NULL
);
