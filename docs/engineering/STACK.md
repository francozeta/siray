# SIRAY Technology Stack

Last updated: 2026-08-26

## Decision

SIRAY starts as a modular monolith with an event-driven integration seam. The pilot must prove that the NFC-assisted ordering flow creates operational value before the system gains another runtime, payment orchestration, generic POS adapters, or distributed infrastructure.

## Adopted baseline

| Layer                  | Choice                                      | Responsibility                                                                                                |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Web and BFF            | Next.js 16 App Router, React 19, TypeScript | Guest menu, staff operations, SSR, route handlers, server actions, guest cookies, command/query orchestration |
| UI                     | Tailwind CSS 4, shadcn components, Base UI  | Accessible Spanish customer and staff interfaces                                                              |
| Validation             | Zod at external boundaries                  | HTTP input, environment, event payload, import, and provider validation                                       |
| Transactional data     | Supabase Postgres 17                        | Tenant, menu, access, session, order, payment, event, and delivery state                                      |
| Authentication         | Supabase Auth with SSR cookies              | Invite-only staff identity; guest ordering has no account                                                     |
| Authorization          | Explicit grants and Row Level Security      | Organization isolation and role-scoped configuration/operations                                               |
| Public data boundary   | Supabase Data API on the `api` schema       | Reviewed staff reads and server-side RPC; no anonymous table access                                           |
| Internal data boundary | Non-exposed `private` schema                | Credential hashes, authorization helpers, events, and integration state                                       |
| Realtime               | Supabase Realtime Broadcast                 | Private kitchen/staff notifications with polling/refetch reconciliation                                       |
| Media                  | Supabase Storage                            | Tenant-scoped menu images when real media enters the product                                                  |
| Hosting                | Vercel                                      | Web previews, production delivery, functions, and basic analytics                                             |
| Unit testing           | Vitest                                      | Domain rules and boundary validation                                                                          |
| Database testing       | Supabase CLI, pgTAP, database linter        | Migrations, constraints, grants, command functions, and RLS behavior                                          |
| Delivery               | GitHub Actions and Release Please           | Reviewed CI, database verification, previews, versions, and changelogs                                        |

## Conditional integration stack

This layer is approved but does not exist until the first durable external integration needs it.

| Layer                   | Choice                                      | Entry trigger                                                                          |
| ----------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Durable work            | Supabase Queues (`pgmq`)                    | POS, printer, webhook, or notification delivery must retry outside the request path    |
| Integration worker      | Go, containerized as `siray-worker`         | A real adapter needs long-running work, bounded concurrency, or persistent connections |
| Database access from Go | `pgx` with a dedicated least-privilege role | The Go worker is approved and deployed                                                 |
| Event contracts         | Versioned JSON envelope and JSON Schema     | TypeScript produces an event consumed by Go or an external customer                    |
| Venue bridge            | Go binary as `siray-edge`                   | A contracted deployment needs LAN printers/POS or offline continuity                   |

The Go worker is not a second product backend. It consumes integration events and records delivery outcomes. Next.js and Postgres continue to own synchronous behavior, authorization, and canonical order state.

## Request and event paths

```text
Synchronous product path
browser → Next.js BFF → transactional Postgres command → response

Authenticated operational update
Postgres commit → private Realtime Broadcast → staff UI → refetch state

Conditional integration path
Postgres command → domain event + queue message (same transaction)
                 → Go worker → POS / printer / webhook / notification
```

No external provider call is allowed inside the guest order transaction. Realtime and queue messages never replace canonical database state.

## Why no ORM

The Supabase JavaScript client and generated database types are sufficient for the pilot. SQL remains the source of truth for constraints, indexes, functions, grants, and RLS. Prisma or another ORM would create a second schema model without replacing security or migration work.

Use direct SQL from Go only through reviewed queries and a restricted role. Use a server-side Postgres client from Next.js only if a measured query or transaction cannot be expressed safely through the Data API or command functions.

## Platform boundaries

- `api` is the only application schema exposed through the Data API.
- Anonymous users receive no table grants and cannot execute the NFC resolver RPC.
- Next.js resolves raw NFC credentials server-side and issues guest sessions.
- Authenticated staff access is constrained by current membership and RLS, not editable user metadata.
- Server code verifies identity with `auth.getClaims()`; it does not authorize from unverified session data.
- Sensitive commands calculate prices and totals in Postgres and commit snapshots, transitions, events, and idempotency atomically.
- Realtime uses private Broadcast. Postgres Changes is not the default transport.
- Persistent Go services use a direct database connection when IPv6 is available or Supavisor session mode otherwise; serverless connections use transaction pooling.
- A server secret key, worker credential, database password, or venue-agent key is never exposed through `NEXT_PUBLIC_` variables.

## Explicit exclusions

Do not add these during the pilot:

- a general Go API or duplicated CRUD backend;
- microservices, Kubernetes, service mesh, or multiple transactional databases;
- Redis, Kafka, NATS, RabbitMQ, or a custom queue implementation;
- Prisma or another ORM;
- GraphQL;
- a native guest app or Web NFC requirement;
- a generic POS plugin platform;
- automated menu publishing from AI output;
- payment processing before ordering retention is demonstrated.

The complete status and revisit trigger for every choice lives in [the architecture decision register](../architecture/DECISION_REGISTER.md).

## Add only after evidence

| Capability          | Initial choice                         | Trigger to add it                                                                        |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Error monitoring    | Structured Vercel logs                 | Add Sentry before the first live paid pilot                                              |
| Product analytics   | First-party access/order events        | Add PostHog only if operational events cannot answer the funnel questions                |
| Payments            | Manual confirmation                    | Select a Peruvian provider after ordering is retained and provider risk/cost is reviewed |
| POS integration     | Manual coexistence                     | Build the first adapter for a committed pilot POS                                        |
| Email               | Supabase development email locally     | Configure production SMTP before inviting real staff                                     |
| Rate limiting       | Designed at BFF and command boundaries | Implement a durable limiter before public guest order submission                         |
| Enterprise identity | Supabase Auth                          | Add SSO/SCIM only for a signed contract                                                  |
| Dedicated tenancy   | Shared schema and RLS                  | Add a separate project/database for contracted isolation or residency                    |

## Environment strategy

Use separate Supabase and Vercel projects for staging and production. Pull requests run migrations and RLS tests against an isolated Docker database. Production migrations are applied from reviewed automation with encrypted Supabase credentials; developers do not mutate production schemas through Studio.

Public variables may be bundled into browser code. Database passwords, access tokens, secret keys, payment credentials, webhook signing secrets, and worker/agent device credentials are server-only.
