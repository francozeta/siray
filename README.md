# SIRAY

SIRAY is an NFC-first B2B ordering system for physical hospitality businesses, starting with cafés, restaurants, and bars in Peru.

The product combines provisioned NFC access points, a mobile menu, service context, order routing, and staff operations. A guest can touch at a table, bar, counter, or pickup zone and send an order without installing an app. SIRAY coexists with the business's current POS instead of replacing it.

## Current state

This repository currently includes:

- a Spanish public positioning page at `/`;
- a functional Spanish customer-flow prototype at `/t/demo`;
- product, market, and architecture documentation in English;
- project-scoped agent skills under `.agents/skills`.

The demo supports product browsing, modifiers, cart management, order submission, and an order-status screen. It intentionally uses local mock data. No order is persisted or sent to Supabase yet.

## Product decisions

- NFC is the primary access path; QR and short links resolve the same opaque service-point identifier as fallbacks.
- Guest ordering requires no account.
- Kitchen/staff explicitly accepts a submitted order.
- Order and payment states are independent.
- Manual payment confirmation is the only MVP payment flow.
- No POS replacement, fintech layer, inventory, invoicing, loyalty, delivery, or marketplace in the MVP.

Read the supporting documents:

- [Peru market discovery](docs/research/PERU_MARKET_DISCOVERY.md)
- [Product strategy](docs/product/PRODUCT_STRATEGY.md)
- [MVP architecture](docs/architecture/MVP_ARCHITECTURE.md)
- [Release and versioning policy](docs/engineering/RELEASES.md)

## Local development

Requirements:

- Node.js 22 or later;
- pnpm 9.15.3.

Install and run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/t/demo](http://localhost:3000/t/demo).

Production checks:

```bash
pnpm lint
pnpm typecheck
pnpm test:conventions
pnpm build
```

## Environment variables

The repository is prepared for Supabase but the current UI prototype does not require a live database.

Expected public variables for the future integration:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The guest-order server endpoints will also require a server-only Supabase secret. Never prefix a secret/service-role key with `NEXT_PUBLIC_` and never expose a database password to browser code.

## Language policy

- Customer and restaurant-facing product interfaces are written in Spanish.
- README files, architecture notes, research, and engineering documentation are written in English.

## Agent skills

The 24 requested skills are vendored under `.agents/skills` so they travel with the repository. Their GitHub sources and content hashes are tracked in `skills-lock.json`.

## Contributions and releases

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Conventional branches and pull request titles are verified in CI. Release Please opens a reviewed draft release pull request only when merged work has a `patch`, `minor`, or explicit `breaking` impact.

## Next implementation milestone

Validate the prototype with one restaurant, then implement the production vertical slice in this order:

1. tenant, catalog, menu, service-zone, service-point, access, session, order, and payment schema;
2. staff authentication and RLS;
3. NFC plate specification, provisioning, and fallback workflow;
4. opaque service-point resolution and guest session cookie;
5. transactional, idempotent order creation;
6. kitchen acceptance and order status updates;
7. guest status polling;
8. manual payment confirmation and session closure;
9. pilot access, hardware, and order instrumentation.
