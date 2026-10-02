# Security policy

Nuvex is not deployed and has not been audited. Do not put value behind these programs.

## Reporting

Report vulnerabilities privately to the maintainers of this repository. Do not open a public issue for an unfixed on-chain bug. Include the program id, the instruction, and a transaction that demonstrates the issue on a local validator.

There is no bug bounty in Milestone 0.

## Scope

In scope once the programs have instructions: account substitution, forged proofs, duplicate fulfillment, callback reentry, fee and stake accounting, and upgrade authority misuse.

Out of scope: the read API returning stale indexed data. The API is not the protocol. A wrong HTTP body is a defect, not a chain compromise, unless a client treats it as final without reading the account.

## Secrets

Node identity, operator authority, treasury, security fund, and upgrade authority are different keys. None of them are in the source tree. See `security/KEY_MANAGEMENT.md`.

## Current posture

The programs export no instructions. The node does not load a signer. That is a smaller attack surface, not a claim of safety for later milestones.
