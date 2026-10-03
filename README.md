# Nuvex services

Off-chain services for Nuvex. This repository does not deploy programs and it is not a source of protocol truth.

- `api/` — HTTP read API. `GET /health` returns `authority: none`. Requests, nodes, and network counts come from the indexer store. Jobs, models, and prices return 501.
- `indexer/` — Decodes known account layouts from `getProgramAccounts` and writes PostgreSQL (or a JSON snapshot). It does not invent rows.
- `data/` — price-provider adapters. Every call is rejected.
- `ai/` — a directory and a README. There is no model.
- `infra/` — local compose file and monitoring config.

The website, the documentation site, and the on-chain protocol are separate repositories. Build the oracle node image in the protocol repository and tag it `nuvex-oracle-node:local` before using the `node` compose profile.

## Indexer

`start` needs `NUVEX_RPC_URL` (or `NUVEX_SOLANA_RPC_URL`), at least one program id (`NUVEX_ORACLE_CORE_PROGRAM_ID`, `NUVEX_ORACLE_REGISTRY_PROGRAM_ID`, `NUVEX_VERIFICATION_PROGRAM_ID`), and either `DATABASE_URL` or `NUVEX_READ_MODEL_PATH`. Without those, the process exits 2. `--health` only checks the process.

Apply the SQL in `indexer/prisma/migrations/` before pointing the API at Postgres.

## Develop

```bash
pnpm install
make check
cp env/.env.local.example .env.local
```

`make check` formats, lints, tests, and validates the Prisma schema. It does not start a database.
