# SIRAY MVP architecture

Last updated: 2026-08-24

## Status

This document defines the target architecture for the first production vertical slice. The current `/t/demo` route is an in-browser table-service prototype and does not persist or transmit orders.

## Stack decision

Keep the current stack:

- Next.js 16 and TypeScript for guest, staff, and administrative web experiences;
- Supabase Postgres as the transactional source of truth;
- Supabase Auth for business staff only;
- Supabase Realtime for authenticated operational views;
- Supabase Storage for product images after the workflow is validated;
- Supabase Queues or a transactional outbox for slow integrations when they become real;
- Vercel for web delivery and server execution close to the database region.

This stack is appropriate for both a small pilot and a multi-location operator when the application starts as a modular monolith, tenant boundaries are explicit, writes are transactional, and slow side effects are removed from the order request path. Microservices, multiple databases, and a generic integration platform would add failure modes before they add scale.

## Architecture principles

- NFC is the primary physical access path.
- QR, short links, and staff-assisted entry resolve the same service-point credential as fallbacks.
- The tag stores only a short HTTPS NDEF URL with an opaque credential.
- A service point is generic: table, bar, counter, pickup zone, seat, or another future context.
- Menus are assigned to locations or service zones, not copied per table or tag.
- PostgreSQL is the source of truth.
- Guests do not create accounts; guest writes use narrow server endpoints.
- Public clients never receive a secret or service-role key.
- Order and payment state are independent.
- Every tenant-owned row carries an explicit tenant boundary.
- Realtime is used where latency changes operations, not as a default transport.
- External delivery, printing, POS, and analytics effects are asynchronous and replayable.

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

## System shape

```text
Guest mobile web
  └─ /go/[opaqueCredential]
       ├─ resolve service point and active menu assignment
       ├─ create or resume a guest session
       ├─ submit an idempotent order
       └─ poll session-scoped order status (MVP)

Next.js modular application
  ├─ public access resolver and menu routes
  ├─ narrow guest order endpoints
  ├─ authenticated staff, kitchen, and administration routes
  ├─ authorization, availability, and price validation
  ├─ manual payment confirmation
  └─ event/outbox producer for asynchronous integrations

Supabase
  ├─ Postgres: tenant, menu, access, session, order, payment, and event data
  ├─ Auth: owner, manager, staff, kitchen, and support identities
  ├─ Realtime: private authenticated operational channels
  ├─ Storage: product images
  └─ Queues: integration and notification work after the pilot
```

## NFC and fallback contract

### Pilot tag

Use a standard NDEF-compatible tag containing one HTTPS URI record. The URI opens the web experience directly; SIRAY does not require Web NFC browser APIs or a native app.

Each physical plate must also display:

- the human-readable service-point label;
- a QR code containing the same URL;
- a short recovery code or URL;
- a clear instruction such as “Toca para pedir”.

### Credential rules

- Use at least 128 bits of random entropy before encoding.
- Store only a keyed hash of the raw credential.
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

| Mode | Session scope | Required order context | Fulfillment instruction |
| --- | --- | --- | --- |
| `TABLE` | One open session per service point | Table or seating label | Deliver to service point |
| `BAR` | Guest session or optional open tab reference | Guest name/number and bar zone | Collect at bar |
| `COUNTER` | One session per browser order | Display number | Collect at counter |
| `PICKUP` | One session per browser order | Guest name/number | Collect at pickup zone |

`fulfillment_mode` belongs to the service zone and is snapshotted onto every order. The order must remain understandable if the zone configuration changes later.

## Core flows

### Resolve access and start session

1. The browser opens `/go/[opaqueCredential]` from NFC, QR, or a short link.
2. The server hashes the credential and resolves one active `access_credential`.
3. The server loads its service point, zone, location, active menu assignment, and fulfillment mode.
4. It verifies that the credential, physical asset, service point, zone, location, and ordering channel are active.
5. It resumes a valid guest session or creates one under the mode's session rules.
6. It issues a random guest-session secret in a Secure, HttpOnly, SameSite=Lax cookie and stores only its hash.
7. The response contains public business, point, fulfillment, and published-menu context.

The URL never contains database IDs or sensitive business data.

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

All primary keys are UUIDs unless a short location-scoped display number is explicitly required. Timestamps use `timestamptz`. Monetary values use `bigint` minor units plus an ISO currency code.

### Tenant and staff

| Table | Important fields and constraints |
| --- | --- |
| `organizations` | `id`, `name`, `status`; commercial tenant root. |
| `businesses` | `id`, `organization_id`, `name`, `slug`, `status`; unique tenant slug. |
| `locations` | `id`, `business_id`, `name`, `timezone`, `currency`, `ordering_enabled`; `PEN` for the pilot. |
| `profiles` | `id` FK to `auth.users`, `display_name`; no authorization data in editable user metadata. |
| `memberships` | organization, user, role, optional business/location scope; roles `OWNER`, `MANAGER`, `STAFF`, `KITCHEN`, `SUPPORT`. |

`auth.users` remains owned by Supabase. Application profiles and authorization scope remain separate from authentication identities.

### Service topology and access

| Table | Important fields and constraints |
| --- | --- |
| `service_zones` | `id`, `location_id`, `name`, `service_mode`, `fulfillment_mode`, `ordering_enabled`. |
| `service_points` | `id`, `zone_id`, `label`, `kind`, `sort_order`, `ordering_enabled`; unique label per zone. |
| `access_credentials` | `id`, `service_point_id`, `token_hash`, `channel`, `status`, timestamps; unique token hash. |
| `nfc_assets` | `id`, asset code, tag technology, URL fingerprint, state, assigned credential/point, install and verification timestamps. |
| `guest_sessions` | `id`, `service_point_id`, guest secret hash, status, optional guest label, opened/closed timestamps. |

Session uniqueness depends on service mode: a table can share one active session while counter and pickup orders usually receive isolated sessions.

### Catalog and menus

| Table | Important fields and constraints |
| --- | --- |
| `catalog_products` | business-owned product identity, name, description, image path, status. |
| `modifier_groups` | business-owned group with minimum/maximum selections. |
| `modifiers` | modifier identity, price delta, availability, sort order. |
| `menus` | business-owned menu identity and lifecycle status. |
| `menu_versions` | immutable version number, draft/published state, creator, published timestamp. |
| `menu_sections` | version-owned category name and sort order. |
| `menu_items` | version/product link with price, currency, availability, and sort order snapshots. |
| `menu_assignments` | published version assigned to a location or service zone with schedule and priority. |
| `menu_import_jobs` | source type, source reference, state, validation summary, reviewer, timestamps. |

Draft edits never mutate a version currently served to guests. Publishing creates an immutable version and atomically changes assignments. Availability can have a fast operational override, but price and modifier structure come from the published version.

### Orders, payments, and events

| Table | Important fields and constraints |
| --- | --- |
| `orders` | session, tenant/location, service point, service/fulfillment snapshots, display number, status, payment status, idempotency key, totals, currency, timestamps. |
| `order_items` | optional product reference plus name, price, quantity, and line-total snapshots. |
| `order_item_modifiers` | optional modifier reference plus name, price delta, and quantity snapshots. |
| `order_events` | append-only state transition, actor, timestamp, and compact metadata. |
| `payments` | order, provider, status, amount, currency, optional external reference, timestamps. |
| `payment_events` | append-only payment event and actor. |
| `outbox_events` | tenant/location, event type, aggregate ID, payload, attempts, available/processed timestamps. |

Historical snapshots remain readable if a catalog item, service point, or menu is later archived.

## Tenant isolation and RLS

- Enable RLS on every table in an exposed schema.
- Explicitly grant only required operations to `authenticated`.
- Staff policies require matching membership plus business/location scope.
- `TO authenticated` alone is not authorization; policies include ownership or membership predicates.
- Guests receive no direct table grants for order creation.
- Guest endpoints validate session, service point, menu, prices, fulfillment, and idempotency before using a server-only secret.
- Never expose a secret/service-role key through a `NEXT_PUBLIC_` variable.
- Exposed views use `security_invoker = true`.
- Index tenant, location, membership, state, and queue lookup columns.
- Test owner, manager, scoped staff, kitchen, support, unrelated authenticated user, and anonymous clients.

## Realtime and asynchronous work

Use private Supabase Realtime Broadcast for authenticated kitchen and staff updates. Current Supabase guidance recommends Broadcast over Postgres Changes for scalability and security. Authorization policies live on supported `realtime.messages` policies; SIRAY must not create custom objects in the locked `realtime` schema.

Guest status starts with a session-scoped polling endpoint because guests do not have Supabase identities. Move guests to private channels only when latency and scale justify issuing and refreshing constrained tokens.

The order transaction writes an `outbox_event` for non-critical side effects. A worker later delivers POS events, printer jobs, webhooks, notifications, and analytics. Supabase Queues is an appropriate managed path when guaranteed background delivery is needed. A failed integration never rolls back or delays an accepted guest order.

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

One deployment, one Supabase project, one database region, one location, and a modular codebase.

### Growth

Keep the same application and data model. Add menu inheritance, location-scoped operations, outbox consumers, queue monitoring, audit search, and usage limits. Scale indexes and connection pooling from observed query plans.

### Enterprise

Add SSO, approval workflows, stronger NFC assets, API credentials, webhook signing, retention controls, support impersonation with audit, and region/failover requirements only when contracts require them. A dedicated database or project per enterprise tenant is a compliance and isolation option, not the default architecture.

Vercel Functions should execute in the same region as the database, or as close as the available platform regions allow.

## Deployment requirements

- Node.js 22 or later.
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
13. Add outbox processing for the first real printer or POS integration.
14. Instrument the access, ordering, fulfillment, and hardware funnels.

## Primary technical references

- [Apple: background NFC tag reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading)
- [Android: NFC basics and NDEF URI handling](https://developer.android.com/develop/connectivity/nfc/nfc)
- [NXP: NTAG 424 DNA Secure Dynamic Messaging](https://www.nxp.com/docs/en/application-note/AN12196.pdf)
- [Supabase: Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Supabase: subscribing to database changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
- [Supabase: Queues](https://supabase.com/docs/guides/queues)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel: function regions](https://vercel.com/docs/functions/configuring-functions/region)
