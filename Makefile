.PHONY: fmt lint test check build

fmt:
	pnpm format

lint:
	pnpm format:check
	pnpm lint

test:
	pnpm test

check: lint test
	DATABASE_URL=postgresql://nuvex:nuvex@127.0.0.1:5432/nuvex pnpm --filter @nuvex/indexer prisma:validate

build:
	pnpm build
