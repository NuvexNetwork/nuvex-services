# Infrastructure

Local development uses `infra/docker-compose.yml`. Kubernetes is not required. The oracle node image is built in the protocol repository and tagged `nuvex-oracle-node:local`.

Terraform in this directory declares no resources. Do not apply it expecting a cluster.
