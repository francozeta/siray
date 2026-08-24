# SIRAY MVP architecture

Last updated: 2026-08-23

## Status

This document defines the target architecture for the first production vertical slice. The current `/t/demo` route is an in-browser prototype and does not persist or transmit orders.

## Architecture principles

- One modular Next.js application, not microservices.
- PostgreSQL is the source of truth.
- Supabase Auth is for business staff only; guests do not create accounts.
- Guest writes go through narrow server endpoints; public clients never receive a secret or service-role key.
- Order and payment state are independent.
- Every tenant-owned row carries an explicit tenant boundary.
- Realtime is used where latency changes operations, not as a default transport.
- QR and NFC resolve the same opaque, rotatable table identifier.

## System shape

```text
Guest mobile web
  └─ /t/[opaqueToken]
       ├─ fetch published menu
       ├─ create/resume guest session
       ├─ submit idempotent order
       └─ poll session-scoped order status (MVP)

Next.js application
  ├─ public table/menu routes
  ├─ narrow guest order endpoints
  ├─ authenticated staff/kitchen routes
  ├─ authorization and price validation
  └─ payment use cases (manual only)

Supabase
  ├─ Postgres: tenant, menu, session, order, payment, and event data
  ├─ Auth: owner/manager/staff/kitchen identities
  ├─ Realtime: authenticated kitchen and staff subscriptions
  └─ Storage: product images after the workflow is validated
```

## Why guest status starts with polling

Authenticated kitchen and staff views benefit directly from Supabase Realtime and can be protected by membership RLS.

Guest subscriptions are harder to secure because a table guest has no Supabase account. The MVP should poll a session-scoped server endpoint every few seconds using an HttpOnly guest-session cookie. This is easier to secure and adequate for coarse order states. Replace polling with a private Realtime channel only when latency or scale justifies the additional token and channel authorization work.

## Core flows

### Resolve table and start session

1. The browser opens `/t/[opaqueToken]`.
2. The server hashes the token and resolves one active `table_identifier`.
3. The server verifies that business, location, table, and digital ordering are active.
4. The server resumes the table's open session or creates one.
5. The server issues a random guest-session secret in a Secure, HttpOnly, SameSite=Lax cookie and stores only its hash.
6. The response contains public business/table context and the published menu.

The URL never contains database IDs or sensitive business data.

### Submit order

1. The client sends product IDs, modifier IDs, quantities, optional notes, and an idempotency key.
2. The server authenticates the guest-session cookie and confirms it belongs to the resolved table session.
3. The server reloads products and modifiers from the published menu.
4. The server rejects unavailable items and invalid modifier combinations.
5. The server calculates totals in integer minor units; it never accepts a client total.
6. One transaction creates the order, item snapshots, modifier snapshots, and initial order event.
7. The order enters `PENDING` and becomes visible to the authenticated kitchen/staff view.
8. A repeated idempotency key returns the existing order.

### Operate order

Allowed MVP transitions:

```text
PENDING → ACCEPTED → PREPARING → READY → DELIVERED
    └──────────────→ CANCELLED
ACCEPTED ──────────→ CANCELLED
```

Each transition checks the current state, actor role, tenant membership, and location. It appends an immutable order event in the same transaction.

### Confirm payment

1. Staff charges the customer in the existing POS, terminal, wallet, transfer flow, or cash.
2. Staff selects “Mark as paid” in SIRAY.
3. SIRAY creates a `MANUAL` payment and a payment event.
4. The related order payment state becomes `PAID` in the same transaction.
5. The session can close when all orders are delivered/cancelled and paid/voided.

SIRAY does not create, capture, refund, or reconcile an external payment in the MVP.

## Data model

All primary keys are UUIDs unless a short, location-scoped display number is explicitly required. Timestamps use `timestamptz`. Monetary values use `bigint` minor units plus an ISO currency code.

### Tenant and staff

| Table | Important fields and constraints |
| --- | --- |
| `organizations` | `id`, `name`, `status`; commercial tenant root. |
| `businesses` | `id`, `organization_id`, `name`, `slug`, `status`; unique `(organization_id, slug)`. |
| `locations` | `id`, `business_id`, `name`, `timezone`, `currency`, `ordering_enabled`; timezone defaults per location, currency is `PEN` for the pilot. |
| `profiles` | `id` FK to `auth.users`, `display_name`; no authorization data in editable user metadata. |
| `memberships` | `organization_id`, `user_id`, `role`, optional `location_id`; unique membership scope; role is `OWNER`, `MANAGER`, `STAFF`, or `KITCHEN`. |

`auth.users` remains owned by Supabase. Application profile data is separated from authentication identities.

### Physical tables and guest sessions

| Table | Important fields and constraints |
| --- | --- |
| `dining_tables` | `id`, `location_id`, `label`, `sort_order`, `ordering_enabled`; unique `(location_id, label)`. |
| `table_identifiers` | `id`, `table_id`, `token_hash`, `status`, `created_at`, `retired_at`; unique token hash; at most one active primary identifier per table. Never store the raw token. |
| `sessions` | `id`, `table_id`, `guest_secret_hash`, `status`, `opened_at`, `closed_at`; status `OPEN`, `PAYMENT_DUE`, `CLOSED`, `CANCELLED`; partial unique index for one open session per table. |

Multiple browser guests may contribute orders to the same table session. The first MVP does not identify seats or individual diners.

### Menu

| Table | Important fields and constraints |
| --- | --- |
| `menus` | `id`, `business_id`, `name`, `status`, `published_at`; only one published pilot menu per location/menu assignment. |
| `categories` | `id`, `menu_id`, `name`, `sort_order`, `available`; unique sort order per menu. |
| `products` | `id`, `category_id`, `name`, `description`, `price_minor`, `currency`, `image_path`, `available`, `sort_order`; non-negative price. |
| `modifier_groups` | `id`, `business_id`, `name`, `min_select`, `max_select`, `required`; `0 <= min_select <= max_select`. |
| `modifiers` | `id`, `modifier_group_id`, `name`, `price_delta_minor`, `available`, `sort_order`. |
| `product_modifier_groups` | `product_id`, `modifier_group_id`, `sort_order`; unique product/group pair. |

Availability is checked again at submit time. Publishing should later use menu versions if restaurants require scheduled or staged changes; versioning is not required for the first pilot.

### Orders and snapshots

| Table | Important fields and constraints |
| --- | --- |
| `orders` | `id`, `session_id`, `business_id`, `location_id`, `display_number`, `status`, `payment_status`, `idempotency_key`, `subtotal_minor`, `total_minor`, `currency`, timestamps; unique `(session_id, idempotency_key)` and `(location_id, service_day, display_number)`. |
| `order_items` | `id`, `order_id`, optional `product_id`, `product_name_snapshot`, `unit_price_minor_snapshot`, `quantity`, `line_total_minor`; positive quantity. |
| `order_item_modifiers` | `id`, `order_item_id`, optional `modifier_id`, `modifier_name_snapshot`, `price_delta_minor_snapshot`, `quantity`; positive quantity. |
| `order_events` | `id`, `order_id`, `from_status`, `to_status`, `actor_type`, optional `actor_user_id`, `created_at`, metadata; append-only audit log. |

Foreign keys to catalog items are nullable on snapshots so a historical order remains readable if a catalog item is archived. Catalog deletion should normally be soft deletion.

### Payments

| Table | Important fields and constraints |
| --- | --- |
| `payments` | `id`, `order_id`, `provider`, `status`, `amount_minor`, `currency`, optional `external_reference`, `created_at`, `completed_at`; provider is `MANUAL` in MVP. |
| `payment_events` | `id`, `payment_id`, `event_type`, `actor_user_id`, optional provider payload, `created_at`; append-only. |

`orders.payment_status` is operationally convenient but must change only in the same transaction as payment creation/update. Future split-table payments may introduce payment allocations; do not add them before the use case exists.

### Product analytics

| Table | Important fields and constraints |
| --- | --- |
| `analytics_events` | `id`, `business_id`, `location_id`, optional `session_id`, optional `order_id`, `event_name`, `occurred_at`, compact metadata; partition or archive only after volume requires it. |

Capture only the events needed for the pilot funnel. Do not include raw guest secrets, sensitive notes, or payment credentials.

## Tenant isolation and RLS

- Enable RLS on every table in an exposed schema.
- Explicitly grant only the operations required by `authenticated`; new Supabase projects no longer expose new tables to the Data API automatically.
- Staff policies require a matching membership and, where present, location scope.
- `TO authenticated` alone is not authorization; every policy includes the ownership/membership predicate.
- Guests receive no direct table grants for order creation. Guest endpoints run on the server and validate the session, table, menu, prices, and idempotency before using a server-only secret.
- Never expose a secret/service-role key through a `NEXT_PUBLIC_` variable.
- Views exposed through the Data API use `security_invoker = true`.
- Index every column used by tenant and membership policies.
- Run RLS tests for owner, manager, staff, kitchen, unrelated authenticated user, and anonymous clients.

## Realtime scope

### Use Realtime now

- new `PENDING` orders for authenticated kitchen/staff at one location;
- order status changes for authenticated staff dashboards;
- payment status changes for staff dashboards.

### Do not use Realtime yet

- menu browsing;
- analytics;
- guest status (polling first);
- administrative configuration.

Supabase locked the `realtime` schema against custom object changes in July 2026. SIRAY must not create or alter objects in that schema; authorization should use supported policies and documented channels only.

## Reliability and abuse controls

- Store only hashes of table and guest secrets.
- Make table identifiers rotatable without changing the physical route format.
- Rate-limit session creation and order submission by token, session, IP signal, and location.
- Require an idempotency key for order creation and state mutations.
- Add a location-level kill switch and table-level pause.
- Display a kitchen connection indicator and last-event timestamp.
- Retry safe reads; never silently retry a write without idempotency.
- Keep order acceptance explicit.
- Log rejection reasons, invalid modifiers, stale prices, and unavailable items.
- Provide staff recovery for duplicate, rejected, and cancelled orders.

## POS coexistence

The MVP works without a POS integration because SIRAY owns only ordering and operational state:

```text
SIRAY: table → order → kitchen → delivery → payment confirmation
POS:   fiscal sale / terminal / cash / external payment record
```

The pilot must measure the cost of POS re-entry. If it erases the order-capture benefit, prioritize one real integration based on pilot evidence. Do not build a generic plugin framework.

## Payment architecture decision

The schema includes `provider`, `external_reference`, and immutable payment events so future providers have somewhere to fit. The application should initially implement a single `markManualPaymentPaid` use case, not a speculative provider interface. Extract a provider contract only when a second provider with known requirements is selected.

## Deployment requirements

- Node.js 22 or later. Supabase client libraries dropped Node.js 20 support in June 2026.
- Pin Supabase packages and commit `pnpm-lock.yaml` when they are added.
- Add a server-only `SUPABASE_SECRET_KEY` only when guest server endpoints are implemented.
- Keep `NEXT_PUBLIC_SUPABASE_URL` and the publishable key public by design; never place database passwords or secret keys in browser code.
- Run database advisors and RLS tests before production.

## Implementation sequence

1. Confirm pilot workflow and data model with one restaurant.
2. Add pinned Supabase clients and server/client factories.
3. Create tenant/menu/table schema with RLS and seed one demo business.
4. Replace mock menu data with a published-menu read.
5. Implement opaque table resolution and guest-session cookie.
6. Implement transactional, idempotent order creation.
7. Build authenticated kitchen acceptance and status transitions with Realtime.
8. Add guest status polling.
9. Implement manual payment confirmation and session closure.
10. Instrument the pilot funnel and operational guardrails.
