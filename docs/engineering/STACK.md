# SIRAY Technology Stack

## Decision

SIRAY is a modular monolith. The pilot should prove that NFC-assisted self-ordering improves restaurant operations before the system gains payment orchestration, generic POS adapters, or separate services.

The production baseline is:

| Layer               | Choice                                      | Pilot responsibility                                                        |
| ------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| Web application     | Next.js 16 App Router, React 19, TypeScript | Guest menu, staff operations, route handlers, and server actions            |
| UI                  | Tailwind CSS 4, shadcn components, Base UI  | Accessible Spanish customer and staff interfaces                            |
| Database            | Supabase Postgres 17                        | Tenant, menu, access, order, payment, and audit state                       |
| Authentication      | Supabase Auth with SSR cookies              | Invite-only staff accounts and verified server-side claims                  |
| Authorization       | Postgres grants and Row Level Security      | Organization isolation and role-based configuration access                  |
| Realtime            | Supabase Realtime Broadcast                 | Private kitchen and staff updates after the first order slice               |
| Media               | Supabase Storage                            | Menu images with tenant-scoped paths and policies                           |
| Background delivery | Transactional outbox, then Supabase Queues  | POS, printer, webhook, and notification retries                             |
| Validation          | Zod                                         | Server action, route-handler, and integration boundaries                    |
| Deployment          | Vercel                                      | Preview deployments, production hosting, functions, and basic web analytics |
| Unit testing        | Vitest                                      | Domain and boundary logic                                                   |
| Database testing    | Supabase CLI, pgTAP, database linter        | Migrations, constraints, grants, and RLS behavior                           |
| Release automation  | GitHub Actions and Release Please           | Reviewed semantic versions and changelogs                                   |

## Why no ORM

The Supabase JavaScript client and generated database types are sufficient for the pilot. SQL remains the source of truth for constraints, indexes, functions, grants, and RLS. Adding Prisma or another ORM would not replace that work and would create a second schema model to keep synchronized.

Use server-side SQL or a pooled Postgres client only if a measured query cannot be expressed safely or efficiently through the Data API.

## Supabase boundaries

- `api` is the only application schema exposed through the Data API.
- `private` contains credential hashes, access events, and authorization helpers.
- Anonymous clients receive no table grants. They can call only narrow guest functions explicitly designed for opaque credentials.
- Authenticated staff access is constrained by organization membership and RLS.
- Server code verifies identity with `auth.getClaims()`; it does not authorize from `getSession()` user data.
- Realtime uses private Broadcast channels. Postgres Changes is not the default because Broadcast is the more scalable and secure path in current Supabase guidance.

## Add only after evidence

| Capability          | Initial choice                     | Trigger to add it                                                                 |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| Error monitoring    | Vercel logs                        | Add Sentry before the first live paid pilot                                       |
| Product analytics   | First-party access/order events    | Add PostHog only if funnel analysis outgrows operational events                   |
| Payments            | Manual confirmation                | Add Mercado Pago or another Peruvian provider after ordering is retained          |
| POS integration     | Outbox contract                    | Build the first adapter for a committed pilot POS, not a generic platform         |
| Email               | Supabase development email locally | Configure production SMTP before inviting real staff                              |
| Rate limiting       | Application and database checks    | Add a durable limiter before public guest order submission                        |
| Enterprise identity | Supabase Auth                      | Add SSO/SCIM only for a signed contract                                           |
| Dedicated services  | Modular monolith                   | Extract a service only after independent scaling or failure isolation is measured |

## Environment strategy

Use separate Supabase projects for staging and production. Pull requests run migrations and RLS tests against an isolated Docker database. Production migrations should be applied by GitHub Actions with encrypted Supabase credentials after review; developers should not make production schema changes through Studio.

Public variables may be bundled into browser code. Database passwords, access tokens, secret keys, payment credentials, and webhook signing secrets are server-only.
