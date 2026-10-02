FROM node:22-bookworm-slim
WORKDIR /app
COPY ai/README.md /README.md
USER node
ENTRYPOINT ["node", "-e", "console.error('nuvex-ai-worker: inference runtime is not implemented (milestone 8)'); process.exit(1)"]
