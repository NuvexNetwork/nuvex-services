FROM node:22-bookworm-slim
RUN npm install -g pnpm@10.15.1
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json api/package.json
COPY indexer/package.json indexer/package.json
COPY data/package.json data/package.json
COPY config config
COPY indexer indexer
RUN pnpm install --frozen-lockfile --filter @nuvex/indexer...
RUN pnpm --filter @nuvex/indexer build
USER node
ENTRYPOINT ["node", "indexer/dist/index.js"]
CMD ["--health"]
