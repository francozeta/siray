# SIRAY

SIRAY is a B2B digital-ordering layer for physical businesses, starting with cafés and casual restaurants in Peru.

The product goal is narrow: let a guest move from a table identifier to a real order that reaches the kitchen without staff capturing the order. SIRAY coexists with the restaurant's current POS instead of replacing it.

## Current state

This repository currently includes:

- a Spanish public positioning page at `/`;
- a functional Spanish customer-flow prototype at `/t/demo`;
- product, market, and architecture documentation in English;
- project-scoped agent skills under `.agents/skills`.

The demo supports product browsing, modifiers, cart management, order submission, and an order-status screen. It intentionally uses local mock data. No order is persisted or sent to Supabase yet.

## Product decisions

- QR first; NFC will resolve the same opaque table identifier later.
- Guest ordering requires no account.
- Kitchen/staff explicitly accepts a submitted order.
- Order and payment states are independent.
- Manual payment confirmation is the only MVP payment flow.
- No POS replacement, fintech layer, inventory, invoicing, loyalty, delivery, or marketplace in the MVP.

Read the supporting documents:

- [Peru market discovery](docs/research/PERU_MARKET_DISCOVERY.md)
- [Product strategy](docs/product/PRODUCT_STRATEGY.md)
- [MVP architecture](docs/architecture/MVP_ARCHITECTURE.md)

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

## Next implementation milestone

Validate the prototype with one restaurant, then implement the production vertical slice in this order:

1. tenant, menu, table, session, order, and payment schema;
2. staff authentication and RLS;
3. opaque table resolution and guest session cookie;
4. transactional, idempotent order creation;
5. kitchen acceptance and order status updates;
6. guest status polling;
7. manual payment confirmation and session closure;
8. pilot event instrumentation.
