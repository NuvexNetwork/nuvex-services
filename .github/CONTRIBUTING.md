# Contributing

```bash
pnpm install
make check
```

The API is not an authority for chain state. Do not return a price, a job result, or an indexed account that the service did not read from the chain. Do not commit `.env` files.
