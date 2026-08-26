# SIRAY production architecture

Last updated: 2026-08-26

## Status

This document defines the target architecture for the first production vertical slice and its intentional path to multi-location and enterprise deployments. The current `/t/demo` route is an in-browser table-service prototype and does not persist or transmit orders.

The architecture is a modular monolith with an event-driven integration seam. SIRAY has one transactional system of record and one web application during the pilot. A Go worker and a venue agent are conditional deployables, not parts of the initial request path.

## Architecture decision

Adopt now:

- Next.js 16 and TypeScript as the web application and backend-for-frontend (BFF);
- Supabase Postgres 17 as the transactional source of truth;
- Supabase Auth for invited staff identities only;
- Postgres grants and RLS for tenant and role authorization;
- Supabase Realtime Broadcast for authenticated operational views;
- Supabase Storage when real menu images are introduced;
- Vercel for web delivery and server execution near the database region.

Add only after a real integration requires it:

- Supabase Queues for durable integration work committed with domain state;
- a Go `siray-worker` for POS, printer, webhook, and notification consumers;
- a Go `siray-edge` venue agent when a contracted customer requires LAN hardware or offline continuity.

Do not add a general Go API, microservices, Kubernetes, Redis, Kafka, a second database, GraphQL, or a generic POS framework during the pilot. Those choices add distributed failure modes without improving the validation loop.

## Architecture principles

- NFC is the primary physical access path.
- QR, short links, and staff-assisted entry resolve the same service-point credential as fallbacks.
- The tag stores only a short HTTPS NDEF URL with an opaque credential.
- A service point is generic: table, bar, counter, pickup zone, seat, or another future context.
- Menus are assigned to locations or service zones, not copied per table or tag.
- PostgreSQL is the source of truth.
- Next.js is the public trust boundary; browsers never invoke credential resolution or privileged order commands directly.
- Guests do not create accounts; guest writes use narrow, rate-limited server endpoints.
- Public clients never receive a secret or service-role key.
- Sensitive commands execute as one database transaction and return an authoritative result.
- Order and payment state are independent.
- Every tenant-owned row carries an explicit tenant boundary.
- Realtime is a delivery hint, not a source of truth; reconnecting clients refetch current state.
- External delivery, printing, POS, and analytics effects are asynchronous and replayable.
- Every network retry and queue consumer is idempotent.

## Domain hierarchy

```text
Organization
└── Business / brand
    └── Location
        ├── Catalog
        ├── Menus and published versions
        └── Service zones
            └── Service points
                ├── NFC asset
                ├── QR fallback
                ├── Short code
                └── Guest sessions and orders
```

The hierarchy supports one owner-operated café and an enterprise with multiple brands and locations without giving either customer a different core model.

## System shape and trust boundaries

```text
Guest browser                         Staff browser
     │ HTTPS                               │ HTTPS + staff JWT
     └──────────────────┬──────────────────┘
                        ▼
             Next.js on Vercel — BFF
             ├─ /go/[opaqueCredential]
             ├─ guest session cookies
             ├─ guest and staff commands
             ├─ public/staff queries
             └─ rate limits and request correlation
                        │ server credentials or user JWT
                        ▼
              Supabase transactional core
              ├─ api: exposed contract, explicit grants, RLS
              ├─ private: secrets, helpers, events, delivery state
              ├─ Auth: invited staff identities
              ├─ Storage: tenant-scoped menu media
              ├─ Realtime Broadcast: private operational hints
              └─ Queues: durable integration messages [conditional]
                        │ pull, acknowledge, retry
                        ▼
              siray-worker in Go [conditional]
              ├─ POS adapters
              ├─ printer delivery
              ├─ signed webhooks
              └─ notifications
                        │ outbound authenticated channel
                        ▼
              siray-edge in Go [enterprise conditional]
              └─ venue LAN printers and legacy POS
```

The guest and staff browsers may use the publishable key. They never receive a Supabase secret key, database password, worker credential, or venue-agent credential. Anonymous users have no table grants and cannot call the NFC credential resolver; Next.js performs that operation server-side.

## Runtime ownership

| Runtime        | Owns                                                                                   | Must not own                                                          |
| -------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Next.js        | HTTP boundary, cookies, UI composition, command/query orchestration, staff SSR         | Durable background loops, POS-specific retry state, LAN device access |
| Postgres       | Invariants, tenant isolation, totals, state transitions, idempotency, immutable events | External HTTP calls in the guest order transaction                    |
| Realtime       | Low-latency authenticated change notification                                          | Canonical order state or guaranteed delivery                          |
| Go worker      | Queue consumption, bounded concurrency, adapter retries, signed delivery               | Guest rendering, menu CRUD, staff authorization policy                |
| Go venue agent | Outbound-only bridge to local printers/POS, local delivery spool                       | Public inbound administration or business data ownership              |

## Application modules

The monolith is split by business capability rather than technical layer:

| Module                 | Responsibility                                                           |
| ---------------------- | ------------------------------------------------------------------------ |
| Identity and tenancy   | Staff identity, organization membership, business/location scope         |
| Service topology       | Locations, zones, service points, ordering switches                      |
| Physical access        | NFC/QR assets, credential rotation, provisioning and access events       |
| Catalog and publishing | Products, modifiers, immutable menu versions and assignments             |
| Guest sessions         | Anonymous session secret, mode-specific lifetime and recovery            |
| Ordering               | Validation, authoritative pricing, idempotent creation and state machine |
| Payments               | Independent payment state and manual confirmation first                  |
| Operations             | Kitchen/bar queues, availability overrides and recovery actions          |
| Integrations           | Versioned event contracts, deliveries and adapter-specific state         |

Modules may share IDs and versioned contracts, but one module must not update another module's tables ad hoc. Cross-module writes go through a reviewed SQL command function or application service. Database row types remain inside infrastructure code; UI components consume explicit domain DTOs.

## NFC and fallback contract

### Pilot tag

Use a standard NDEF-compatible tag containing one HTTPS URI record. The URI opens the web experience directly; SIRAY does not require Web NFC browser APIs or a native app.

Each physical plate must also display:

- the human-readable service-point label;
- a QR code containing the same URL;
- a short recovery code or URL;
- a clear instruction such as “Toca para pedir”.

### Credential rules

- Generate at least 128 bits of random entropy and store only its one-way SHA-256 hash; never store the raw credential.
- Never encode organization, location, table, menu, price, or sequential IDs in the URL.
- Allow multiple active access methods for one service point.
- Rotate a compromised credential without recreating the service point or menu.
- Record access origin (`NFC`, `QR`, `SHORT_LINK`, `STAFF`) through distinct credential aliases or signed source parameters; never trust a client-only analytics label.

### Hardware lifecycle

```text
INVENTORY → PROGRAMMED → INSTALLED → ACTIVE → RETIRED
                                  ├─ DAMAGED
                                  ├─ MISSING
                                  └─ REPLACED
```

The provisioning record includes tag technology, encoded URL fingerprint, physical design, assigned service point, installation timestamp, installer, last verification, and retirement reason.

### Higher-risk deployments

Static tags can be copied or their URLs photographed. The pilot uses staff acceptance, rate limits, location kill switches, rotatable credentials, and installation checks. Customers that require stronger proof of physical presence may use cryptographic tags with dynamic URL parameters, such as Secure Dynamic Messaging hardware. That tier needs a dedicated provisioning and verification service and must not be presented as a property of standard tags.

## Service modes

| Mode      | Session scope                                | Required order context         | Fulfillment instruction  |
| --------- | -------------------------------------------- | ------------------------------ | ------------------------ |
| `TABLE`   | One open session per service point           | Table or seating label         | Deliver to service point |
| `BAR`     | Guest session or optional open tab reference | Guest name/number and bar zone | Collect at bar           |
| `COUNTER` | One session per browser order                | Display number                 | Collect at counter       |
| `PICKUP`  | One session per browser order                | Guest name/number              | Collect at pickup zone   |

`fulfillment_mode` belongs to the service zone and is snapshotted onto every order. The order must remain understandable if the zone configuration changes later.

## Core flows

### Resolve access and start session

1. The browser opens `/go/[opaqueCredential]` from NFC, QR, or a short link.
2. Next.js hashes the credential and calls the server-only `resolve_access` database function.
3. The server loads its service point, zone, location, active menu assignment, and fulfillment mode.
4. It verifies that the credential, physical asset, service point, zone, location, and ordering channel are active.
5. It resumes a valid guest session or creates one under the mode's session rules.
6. It issues a random guest-session secret in a Secure, HttpOnly, SameSite=Lax cookie and stores only its hash.
7. The response contains public business, point, fulfillment, and published-menu context.

The URL never contains database IDs or sensitive business data. The browser cannot call `resolve_access` through the Data API; this preserves server-side rate limiting, audit, and session issuance.

### Submit order

1. The client sends product IDs, modifier IDs, quantities, optional notes, guest label when required, and an idempotency key.
2. The server authenticates the guest-session cookie and resolved access context.
3. It reloads the current published menu version and availability.
4. It rejects invalid products, modifiers, schedules, point state, or fulfillment requirements.
5. It calculates totals in integer minor units and never accepts a client total.
6. One transaction creates the order, item snapshots, modifier snapshots, fulfillment snapshot, and initial order event.
7. The order enters `PENDING` and becomes visible to the authorized location team.
8. A repeated idempotency key returns the existing order.

### Operate order

Allowed MVP transitions:

```text
PENDING → ACCEPTED → PREPARING → READY → FULFILLED
    └──────────────→ CANCELLED
ACCEPTED ──────────→ CANCELLED
```

Each transition checks current state, actor role, tenant membership, location, and allowed station. It appends an immutable order event in the same transaction.

### Confirm payment

1. Staff charges through the existing POS, terminal, wallet, transfer flow, or cash.
2. Staff selects “Mark as paid” in SIRAY.
3. SIRAY creates a `MANUAL` payment and payment event.
4. The order payment state becomes `PAID` in the same transaction.
5. The session closes according to its service mode after orders are fulfilled/cancelled and paid/voided.

SIRAY does not create, capture, refund, or reconcile an external payment in the MVP.

## Data model

Internal relational keys use `bigint generated always as identity` for compact indexes and joins. Externally visible resources use opaque high-entropy credentials or non-sequential UUID public identifiers; internal numeric IDs never appear in guest URLs. Timestamps use `timestamptz`. Monetary values use integer minor units plus an ISO currency code, promoting to `bigint` only if a domain can exceed 32-bit minor-unit bounds.

### Tenant and staff

| Table                  | Important fields and constraints                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `organizations`        | `id`, `name`, `status`; commercial tenant root.                                                                                                |
| `businesses`           | `id`, `organization_id`, `name`, `slug`, `status`; unique tenant slug.                                                                         |
| `locations`            | `id`, `business_id`, `name`, `timezone`, `currency`, `ordering_enabled`; `PEN` for the pilot.                                                  |
| `profiles` [future]    | `id` FK to `auth.users`, `display_name`; no authorization data in editable user metadata.                                                      |
| `organization_members` | organization, user, role and status; initial roles `OWNER`, `ADMIN`, `OPERATOR`, `VIEWER`. Location-scoped assignments arrive with operations. |

`auth.users` remains owned by Supabase. Application profiles and authorization scope remain separate from authentication identities.

### Service topology and access

| Table                | Important fields and constraints                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `service_zones`      | `id`, `location_id`, `name`, `service_mode`, `fulfillment_mode`, `ordering_enabled`.                      |
| `service_points`     | `id`, `zone_id`, `label`, `kind`, `sort_order`, `ordering_enabled`; unique label per zone.                |
| `access_credentials` | private token hash, service point, access method, status and expiry; raw credentials are never persisted. |
| `access_assets`      | asset code, technology, lifecycle state, assigned point, installation and verification timestamps.        |
| `guest_sessions`     | `id`, `service_point_id`, guest secret hash, status, optional guest label, opened/closed timestamps.      |

Session uniqueness depends on service mode: a table can share one active session while counter and pickup orders usually receive isolated sessions.

### Catalog and menus

| Table                          | Important fields and constraints                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `catalogs`                     | business-owned reusable product collection.                                          |
| `products`                     | catalog-owned identity, name, description, image path, availability and status.      |
| `modifier_groups` [next slice] | business-owned group with minimum/maximum selections.                                |
| `modifiers` [next slice]       | modifier identity, price delta, availability and sort order.                         |
| `menus`                        | business-owned menu identity and lifecycle status.                                   |
| `menu_versions`                | immutable version number, draft/published state, creator, published timestamp.       |
| `menu_sections`                | version-owned category name and sort order.                                          |
| `menu_items`                   | version/product link with price, currency, availability, and sort order snapshots.   |
| `menu_assignments`             | published version assigned to a location or service zone with schedule and priority. |
| `menu_import_jobs` [later]     | source type, source reference, state, validation summary, reviewer, timestamps.      |

Draft edits never mutate a version currently served to guests. Publishing creates an immutable version and atomically changes assignments. Availability can have a fast operational override, but price and modifier structure come from the published version.

### Orders, payments, and events

| Table                                  | Important fields and constraints                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orders`                               | session, tenant/location, service point, service/fulfillment snapshots, display number, status, payment status, idempotency key, totals, currency, timestamps. |
| `order_items`                          | optional product reference plus name, price, quantity, and line-total snapshots.                                                                               |
| `order_item_modifiers`                 | optional modifier reference plus name, price delta, and quantity snapshots.                                                                                    |
| `order_events`                         | append-only state transition, actor, timestamp, and compact metadata.                                                                                          |
| `payments`                             | order, provider, status, amount, currency, optional external reference, timestamps.                                                                            |
| `payment_events`                       | append-only payment event and actor.                                                                                                                           |
| `integration_deliveries` [conditional] | event ID, destination, attempt state, provider reference and last error when an adapter needs searchable delivery history beyond the queue archive.            |

Historical snapshots remain readable if a catalog item, service point, or menu is later archived.

## Tenant isolation and RLS

- Enable RLS on every table in an exposed schema.
- Explicitly grant only required operations to `authenticated`.
- Staff policies require active organization membership; business/location scope is added with the operations slice before multi-location access.
- `TO authenticated` alone is not authorization; policies include ownership or membership predicates.
- Guests receive no direct table grants for order creation.
- Guest endpoints validate session, service point, menu, prices, fulfillment, and idempotency before invoking server-only database commands.
- Never expose a secret/service-role key through a `NEXT_PUBLIC_` variable.
- Exposed views use `security_invoker = true`.
- Index tenant, location, membership, state, and queue lookup columns.
- Test every implemented role plus an unrelated authenticated user, anonymous access, server-only commands, and cross-tenant writes. Add location and kitchen cases when those scopes exist.

## Realtime and asynchronous work

Use private Supabase Realtime Broadcast for authenticated kitchen and staff updates. Current Supabase guidance recommends Broadcast over Postgres Changes for scalability and security. Authorization policies live on supported `realtime.messages` policies; SIRAY must not create custom objects in the locked `realtime` schema.

Guest status starts with a session-scoped polling endpoint because guests do not have Supabase identities. Move guests to private channels only when latency and scale justify issuing and refreshing constrained tokens.

No broker or worker is needed for the first end-to-end order slice. When the first real POS, printer, webhook, or notification requires retries, enable Supabase Queues and enqueue a versioned integration event inside the same transaction that appends the domain event. Because the queue is Postgres-native, this preserves atomic commit without maintaining a second hand-built outbox table.

Consumers still behave as if delivery is at least once: a worker can finish an external side effect and crash before acknowledging the queue message. Every adapter therefore stores and checks the event ID or provider idempotency key. Queue messages use a versioned envelope:

```text
event_id · event_type · schema_version · occurred_at
organization_id · location_id · aggregate_id · correlation_id · payload
```

The Go worker appears only when one of these triggers is true:

- a committed integration needs durable retry or bounded concurrency;
- work can outlive a serverless request;
- a printer/POS protocol needs a long-lived connection;
- two adapters need the same delivery and observability behavior.

The worker uses a dedicated least-privilege database role and a persistent connection through the direct endpoint or Supavisor session mode. It does not use a public key and does not become a second business API. A failed integration never rolls back or delays an accepted guest order.

Supabase Edge Functions remain available for small isolated webhooks close to Supabase, but not for CPU-heavy jobs, indefinite consumers, or logic already owned by Next.js. Kafka, RabbitMQ, NATS, and Redis queues remain rejected until measured throughput or isolation needs exceed Postgres-native Queues.

## Failure and consistency model

| Failure                         | Required behavior                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Repeated guest submission       | Return the original order for the same session and idempotency key                       |
| Browser disconnect after submit | Order remains committed; guest can resume from the HttpOnly session                      |
| Realtime disconnect             | Show degraded state, reconnect, then refetch authoritative state                         |
| Worker crash                    | Queue visibility timeout makes work available again; consumer deduplicates by event ID   |
| POS/printer unavailable         | Keep order operational in SIRAY, retry asynchronously, surface delivery failure to staff |
| Stale menu or price             | Reject with a refreshable conflict; never accept client totals                           |
| NFC credential compromised      | Revoke/rotate credential without replacing the service point or menu                     |
| Location emergency              | Location/zone/point kill switch stops new sessions and orders without deleting history   |

## Reliability and abuse controls

- Store only hashes of access and guest secrets.
- Make credentials rotatable without changing the service point or physical route shape.
- Rate-limit access resolution, session creation, and order submission by credential, session, IP signal, and location.
- Require idempotency keys for order creation and state mutations.
- Add kill switches at organization, location, zone, point, credential, menu, category, and product levels.
- Display connection state and last-event time on operational screens.
- Retry safe reads; never retry writes without idempotency.
- Keep order acceptance explicit.
- Log rejected access, invalid modifiers, stale prices, unavailable items, and failed hardware checks.
- Keep QR and short-code recovery available when NFC is unsupported, damaged, or disabled.
- Provide staff recovery for duplicate, rejected, cancelled, and misrouted orders.

## POS coexistence

```text
SIRAY: access → context → order → preparation → fulfillment → payment confirmation
POS:   fiscal sale / terminal / cash / external payment record
```

The pilot measures the cost of POS re-entry. If it erases the capture benefit, prioritize one connector from a real pilot. Do not build a generic plugin system first.

## Scaling path

### Pilot

One Next.js deployment, one Supabase project per environment, one database region, one location, and no Go service. Scale vertically only after query and connection measurements.

### Growth

Keep the same application and data model. Add menu inheritance, location-scoped operations, Supabase Queues, the Go integration worker, queue monitoring, audit search, and usage limits. Scale indexes and connection pooling from observed query plans.

### Enterprise

Add SSO, approval workflows, stronger NFC assets, API credentials, webhook signing, retention controls, support impersonation with audit, and region/failover requirements only when contracts require them. Add the outbound-only Go venue agent only for LAN hardware or offline requirements. A dedicated database or project per enterprise tenant is a compliance and isolation option, not the default architecture.

Vercel Functions should execute in the same region as the database, or as close as the available platform regions allow.

## Deployment requirements

- Node.js 24, matching `.nvmrc`, CI, and `package.json`.
- Pin Supabase packages and commit `pnpm-lock.yaml` when they are added.
- Use current publishable and secret key formats; never place a secret or database password in browser code.
- Add a server-only `SUPABASE_SECRET_KEY` only when guest endpoints are implemented.
- Run database advisors, migration verification, and RLS tests before production.
- Keep CI, release versioning, and production deployment as separate workflows.

## Implementation sequence

1. Validate table and shared-pickup flows with one design partner.
2. Specify the physical NFC plate, QR fallback, provisioning checklist, and replacement flow.
3. Add pinned Supabase clients and server/client factories.
4. Create tenant, service topology, access, and menu schema with tested RLS.
5. Seed one location with table and shared-pickup service points.
6. Replace mock data with a reviewed published-menu read.
7. Implement `/go/[credential]`, guest-session cookies, and access-origin analytics.
8. Implement transactional, idempotent order creation.
9. Build authenticated acceptance and status transitions with private Realtime Broadcast.
10. Add guest status polling and fulfillment-specific instructions.
11. Implement manual payment confirmation and session closure.
12. Add CSV import with validation preview.
13. Enable Supabase Queues and add the Go worker for the first real printer or POS integration.
14. Instrument the access, ordering, fulfillment, and hardware funnels.

## Primary technical references

- [Apple: background NFC tag reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading)
- [Android: NFC basics and NDEF URI handling](https://developer.android.com/develop/connectivity/nfc/nfc)
- [NXP: NTAG 424 DNA Secure Dynamic Messaging](https://www.nxp.com/docs/en/application-note/AN12196.pdf)
- [Supabase: Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Supabase: subscribing to database changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
- [Supabase: Queues](https://supabase.com/docs/guides/queues)
- [Supabase: connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase: Edge Function limits](https://supabase.com/docs/guides/functions/limits)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Go: concurrency](https://go.dev/doc/effective_go#concurrency)
- [Vercel: Go runtime](https://vercel.com/docs/functions/runtimes/go)
- [Vercel: function regions](https://vercel.com/docs/functions/configuring-functions/region)
