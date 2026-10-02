# Nuvex services

Off-chain services for Nuvex. This repository does not deploy programs and it is not a source of protocol truth.

- `api/` — HTTP API. It does not sign or authorize chain state.
- `indexer/` — PostgreSQL schema. Chain indexing is not implemented.
- `data/` — price-provider adapters. Every call is rejected.
- `ai/` — a directory and a README. There is no model.
- `infra/` — local compose file and monitoring config.

The website, the documentation site, and the on-chain protocol are separate repositories. Build the oracle node image in the protocol repository and tag it `nuvex-oracle-node:local` before using the `node` compose profile.

## Develop

```bash
pnpm install
make check
cp env/.env.local.example .env.local
```

`make check` formats, lints, tests, and validates the Prisma schema. It does not start a database.
