# SIRAY Architecture Decision Register

Last updated: 2026-08-26

## Purpose

This register prevents the architecture from growing through taste alone. A technology enters SIRAY only when it owns a clear responsibility, removes a measured constraint, or is required by a committed customer. A rejected decision can be reopened, but only with new evidence and a replacement decision record.

Statuses:

- **Adopted** — part of the approved architecture and may be implemented in the relevant slice.
- **Required gate** — must exist before the named production capability goes live.
- **Conditional** — approved direction, but must not be added until its trigger is true.
- **Rejected for now** — intentionally excluded; adding it requires revisiting this register.

## Core architecture

| ID       | Status           | Decision                                                                              | Reason                                                                                           | Revisit trigger                                                                                    |
| -------- | ---------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| ARCH-001 | Adopted          | Modular monolith for the transactional product                                        | Keeps domain boundaries without distributed deployment and consistency costs                     | A module needs independent scaling, ownership, or failure isolation proven by production data      |
| ARCH-002 | Adopted          | Next.js is the web application and BFF                                                | One trust boundary for guest cookies, staff SSR, commands, rate limits, and UI                   | A non-web client needs a stable public API or request load exceeds the platform after optimization |
| ARCH-003 | Adopted          | Supabase Postgres is the single transactional source of truth                         | Orders, prices, states, tenant rules, and idempotency require one atomic boundary                | A contracted residency/isolation requirement or measured database ceiling                          |
| ARCH-004 | Adopted          | Shared-schema multi-tenancy with explicit organization/business/location keys and RLS | Supports small and multi-location customers with one model                                       | Enterprise contract requires a dedicated project/database                                          |
| ARCH-005 | Rejected for now | Microservices and Kubernetes                                                          | They add network failures, orchestration, duplicated auth, and operational overhead before scale | At least one independently scalable service exists and managed containers are insufficient         |
| ARCH-006 | Conditional      | Dedicated Supabase project/database per enterprise tenant                             | Stronger contractual isolation and regional control                                              | Signed requirement for isolation, residency, custom backup, or independent maintenance windows     |

## Data and API boundaries

| ID       | Status           | Decision                                                                       | Reason                                                                               | Revisit trigger                                                                                         |
| -------- | ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| DATA-001 | Adopted          | SQL migrations, constraints, generated types, and RLS; no ORM                  | SQL remains the authority for tenant security, functions, indexes, and transactions  | Repeated domain-query complexity is demonstrably reduced by an ORM without duplicating schema authority |
| DATA-002 | Adopted          | `bigint` identity keys internally; opaque tokens or UUID public IDs externally | Compact relational indexes without leaking enumerable identifiers                    | A distributed writer requires decentralized key generation                                              |
| DATA-003 | Adopted          | `api` is the only Data API schema; `private` owns secrets and helpers          | Explicit exposure is easier to review and test                                       | Never reopen to exposing `public` by default                                                            |
| DATA-004 | Adopted          | Staff identity in Supabase Auth; authorization in application tables and RLS   | Authentication claims do not replace fresh tenant membership state                   | A signed SSO/SCIM requirement                                                                           |
| DATA-005 | Rejected for now | Anonymous direct table writes or NFC resolver RPC calls                        | Bypasses server rate limits, session issuance, orchestration, and audit              | No planned revisit; public commands remain narrow BFF endpoints                                         |
| DATA-006 | Adopted          | Sensitive writes use transactional database command functions                  | Price validation, snapshots, events, state changes, and idempotency commit together  | Only split when the invariant no longer spans the same transaction                                      |
| DATA-007 | Rejected for now | GraphQL                                                                        | The typed REST/RPC surface already covers the pilot and avoids a second API contract | A real client needs graph composition that cannot be served efficiently through task-specific queries   |

## Realtime, queues, and consistency

| ID      | Status                    | Decision                                                              | Reason                                                                          | Revisit trigger                                                                   |
| ------- | ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| EVT-001 | Adopted                   | Private Realtime Broadcast for staff operations                       | Current Supabase guidance favors Broadcast for scalability and authorization    | Benchmarks or a platform change invalidate the choice                             |
| EVT-002 | Rejected for now          | Postgres Changes as the default UI transport                          | It couples clients to tables and scales authorization less efficiently          | A tiny internal-only view where simpler setup materially wins and load is bounded |
| EVT-003 | Adopted                   | Polling fallback and refetch after reconnect                          | Realtime messages are transient hints, not canonical state                      | Never remove the reconciliation path                                              |
| EVT-004 | Conditional               | Supabase Queues for integration delivery                              | Postgres-native durable messages can commit with domain events                  | First printer, POS, webhook, or notification needs retry outside the request      |
| EVT-005 | Rejected for now          | Kafka, NATS, RabbitMQ, Redis queues, or a duplicate hand-built outbox | Unnecessary infrastructure while Postgres-native Queues meet the delivery model | Measured throughput, fan-out, retention, or isolation exceeds Queues              |
| EVT-006 | Adopted when queues begin | Consumers deduplicate by versioned event ID                           | External effects can complete before acknowledgement and therefore repeat       | Never weaken this guarantee                                                       |

## Runtime decisions

| ID      | Status           | Decision                                             | Reason                                                                                                | Revisit trigger                                                               |
| ------- | ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| RUN-001 | Adopted          | TypeScript/Next.js owns synchronous product behavior | Maximizes delivery speed and keeps guest/staff behavior together                                      | None for the pilot                                                            |
| RUN-002 | Rejected for now | A parallel Go CRUD or public API backend             | Duplicates validation, auth, deployment, and contracts without a current bottleneck                   | A specific independently deployed API has measured runtime needs              |
| RUN-003 | Conditional      | `siray-worker` in Go                                 | Strong fit for bounded concurrency, long-lived connections, small containers, and integration retries | EVT-004 is triggered or two real adapters share delivery infrastructure       |
| RUN-004 | Conditional      | `siray-edge` outbound-only Go venue agent            | A small cross-platform binary can bridge LAN printers/POS and maintain a local spool                  | Contracted customer needs local hardware or offline continuity                |
| RUN-005 | Conditional      | Supabase Edge Functions for isolated small webhooks  | Useful near Supabase, but not for indefinite consumers or CPU-heavy work                              | A webhook benefits from independent deployment and does not belong in Next.js |
| RUN-006 | Rejected for now | Root Go module or empty Go service scaffold          | An unused runtime creates maintenance and CI cost                                                     | RUN-003 or RUN-004 trigger becomes true                                       |

When Go is introduced, it lives in the same repository as a separate deployable, consumes versioned JSON event contracts, uses a dedicated least-privilege database role, and never becomes the source of truth for orders or authorization.

## Product and integration scope

| ID       | Status           | Decision                                                     | Reason                                                                     | Revisit trigger                                                                    |
| -------- | ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| PROD-001 | Adopted          | Standard NDEF URL tag with QR and short-code fallback        | Cheapest reliable way to test the NFC behavior and physical product        | Pilot threat data shows copying/tampering is operationally significant             |
| PROD-002 | Conditional      | Cryptographic NFC such as dynamic secure messaging           | Stronger physical-presence evidence with higher hardware/provisioning cost | Committed high-risk deployment defines the threat model and pays the complexity    |
| PROD-003 | Rejected for now | Native guest application or Web NFC dependency               | The product promise is no install; OS-level URL handling is sufficient     | A separate staff/hardware use case proves native capability is necessary           |
| INT-001  | Adopted          | Manual POS coexistence and payment confirmation in the pilot | Validates capture and operations without betting on one provider           | Re-entry time erases product value or a design partner commits to one integration  |
| INT-002  | Rejected for now | Generic POS/plugin platform                                  | No verified common contract exists yet                                     | Two shipped adapters reveal a stable shared interface                              |
| INT-003  | Conditional      | Mercado Pago or another Peruvian payment provider            | Payment is valuable only after ordering behavior is retained               | Pilot demonstrates retained ordering and a provider/cost/risk review is approved   |
| INT-004  | Conditional      | AI-assisted menu extraction                                  | Useful as a reviewed draft, not a publishing authority                     | Guided editor and CSV import are working and setup time remains a major bottleneck |

## Operational gates

| Gate                          | Required before production use                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Public NFC resolution         | Server-only resolver, rotatable hashed credentials, audit event, rate limits, inactive-location response, QR/short-code recovery   |
| Guest order submission        | HttpOnly guest session, authoritative price/modifier validation, idempotency, transactional snapshots, abuse controls              |
| Kitchen operations            | Invite-only staff auth, tested RLS, explicit acceptance, private Broadcast, polling/refetch fallback, visible connection state     |
| First paid live pilot         | Error monitoring, production SMTP, backup/PITR decision, incident contacts, rollback/runbook, structured correlation IDs           |
| First external integration    | Supabase Queue, versioned event envelope, idempotent adapter, retry/dead-letter policy, delivery visibility, dedicated worker role |
| Venue LAN/offline integration | Registered device identity, outbound-only encrypted channel, local durable spool, remote revocation, signed updates                |
| Enterprise launch             | Scoped roles, audit export, retention policy, SSO decision, support access audit, residency/isolation review                       |

## Evidence required to expand

Architecture expansion should reference at least one of:

- a signed customer requirement;
- a pilot metric or incident showing the current boundary fails;
- a measured latency, throughput, connection, or cost ceiling;
- two real implementations exposing a reusable abstraction;
- a security or compliance requirement with an identified threat.

“It would be cool”, theoretical scale, or library popularity is not sufficient evidence by itself.
