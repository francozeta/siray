# SIRAY

SIRAY is an NFC-first B2B ordering system for physical hospitality businesses, starting with cafés, restaurants, and bars in Peru.

The product combines provisioned NFC access points, a mobile menu, service context, order routing, and staff operations. A guest can touch at a table, bar, counter, or pickup zone and send an order without installing an app. SIRAY coexists with the business's current POS instead of replacing it.

## Current state

This repository currently includes:

- a Spanish public positioning page at `/`;
- a functional Spanish customer-flow prototype at `/t/demo`;
- a versioned Supabase schema for tenants, service points, access assets, and menus;
- typed browser/server Supabase clients prepared for staff authentication;
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
- [Technology stack](docs/engineering/STACK.md)
- [Release and versioning policy](docs/engineering/RELEASES.md)

## Local development

Requirements:

- Node.js 24;
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
pnpm test
pnpm build
```

### Local database

Supabase local development requires Docker Desktop. The CLI is pinned in this repository, so no global installation is needed.

```bash
pnpm db:start
pnpm db:lint
pnpm db:test
pnpm db:types
pnpm db:stop
```

Database migrations live in `supabase/migrations`, and pgTAP security tests live in `supabase/tests`. GitHub Actions runs them in Docker even when a contributor does not have Docker locally.

## Environment variables

Copy `.env.example` to `.env.local` and replace the browser-safe placeholders with values from the Supabase Connect dialog. The current UI prototype still renders without querying the database.

Browser-safe variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Database deployment uses `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_PROJECT_ID` in encrypted CI secrets. Future administrative server flows will use `SUPABASE_SECRET_KEY`. Never prefix a secret key or database password with `NEXT_PUBLIC_`.

## Language policy

- Customer and restaurant-facing product interfaces are written in Spanish.
- README files, architecture notes, research, and engineering documentation are written in English.

## Agent skills

The 24 requested skills are vendored under `.agents/skills` so they travel with the repository. Their GitHub sources and content hashes are tracked in `skills-lock.json`.

## Contributions and releases

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Conventional branches and pull request titles are verified in CI. Release Please opens a reviewed draft release pull request only when merged work has a `patch`, `minor`, or explicit `breaking` impact.

## Next implementation milestone

Validate the prototype with one restaurant, then implement the production vertical slice in this order:

1. connect the reviewed migration to staging and production Supabase projects;
2. implement invite-only staff authentication and organization onboarding;
3. implement NFC credential provisioning and the `/go/[token]` resolver;
4. load a published menu from the assigned location or service zone;
5. add guest sessions and transactional, idempotent order creation;
6. add kitchen acceptance with private Realtime Broadcast;
7. add guest status polling and manual payment confirmation;
8. instrument the pilot access, hardware, and order funnels.
