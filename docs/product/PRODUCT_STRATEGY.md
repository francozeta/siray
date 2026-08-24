# SIRAY product strategy

Last updated: 2026-08-24

## Product decision

SIRAY is an NFC-first ordering system for cafés, restaurants, bars, food halls, and other physical hospitality businesses.

The NFC touchpoint is part of the product, not a future accessory. SIRAY includes the physical access kit, tag provisioning, the mobile menu, order routing, staff operations, and measurement. QR and short links remain visible fallbacks so service never depends on one phone capability or one intact tag.

NFC is the recognizable interaction and commercial wedge. The durable advantage must come from the operational system behind it: fast setup, correct context, reliable routing, hardware lifecycle management, and coexistence with the tools a business already uses.

## Product promise

> One touch opens the right menu and sends the order to the right team.

SIRAY should make the physical service point understandable to software without making the guest install an app or create an account.

## Operating model

The catalog, menu, service context, and physical tag are separate concepts:

```text
Organization
└── Brand or business
    └── Location
        ├── Catalog
        ├── Published menus
        └── Service zones
            └── Service points
                └── Access methods: NFC · QR · short link · staff link
```

- A **catalog** contains reusable products, modifiers, images, and tax metadata.
- A **menu** selects, prices, organizes, and schedules catalog items for a channel or location.
- A **service zone** defines how orders are fulfilled: table delivery, bar pickup, counter pickup, or takeaway.
- A **service point** identifies the guest's immediate context: Table 07, Main Bar, Counter A, or Pickup Shelf.
- An **access method** opens that service point. NFC is primary; QR and a short code are fallbacks.

This prevents a menu copy per table. Most tables share one published menu while each table keeps its own delivery context.

## Service modes

| Mode | Physical setup | Guest identity | Fulfillment | Best initial fit |
| --- | --- | --- | --- | --- |
| Table | One plate per table or seating area | Anonymous table session | Staff delivers to the table | Restaurants, cafés, food halls |
| Bar | One or more shared bar touchpoints | Name, number, or open tab reference | Guest collects at the bar | Bars, breweries, event counters |
| Counter | Touchpoint before or at the queue | Order number | Counter collection | Fast casual, bakeries, coffee shops |
| Pickup | Touchpoint in an entrance or pickup zone | Name or order number | Dedicated pickup area | Takeaway and pre-order operations |
| Hybrid | Multiple zones at one location | Context depends on entry point | Table or collection | Venues that change service by time of day |

The first production slice should implement table service and one shared pickup mode. The underlying model must not hard-code every session to a dining table.

## Menu creation paths

SIRAY should offer progressively more automation without hiding an approval step.

### 1. Guided editor

The owner creates categories, products, prices, modifier groups, availability, and photos in SIRAY. This is the dependable path for small businesses and the fallback for every customer.

### 2. Assisted import

Import from CSV or a structured spreadsheet. Show a validation preview for duplicates, missing prices, invalid modifier ranges, and image gaps before publishing.

### 3. Document-assisted setup

Extract a draft from an existing PDF, image, or public menu. AI may propose names, descriptions, categories, and prices, but a manager must review every result before it reaches a guest.

### 4. POS or commerce synchronization

For larger customers, synchronize catalog, prices, and availability from one selected system of record. Build one connector from a real customer requirement before designing a generic integration platform.

### 5. Multi-location templates

An organization defines a base menu, then locations inherit it with controlled overrides for price, availability, schedule, and local products. Publishing must show which locations will change.

## Target segments

### Small business

- one location;
- owner-managed menu;
- SIRAY-hosted operations;
- managed NFC setup;
- shared phone, tablet, or printer for order alerts;
- simple monthly subscription plus initial hardware kit.

The experience must be usable without an IT team or a POS integration.

### Growing operator

- several locations or service zones;
- reusable menu templates;
- role-based access;
- kitchen and front-of-house views;
- operational reports;
- one or two proven integrations.

### Enterprise or design partner

- multiple brands and locations;
- location-scoped roles and audit history;
- staged menu publishing and approvals;
- tag inventory, replacement, and installation tracking;
- API and event delivery for POS, printing, and data platforms;
- SSO, contractual support, and data-retention controls when required.

Acailab-like operators are valuable design partners because they combine branded customer experience, modifier-heavy products, peak demand, and multiple operational contexts. Enterprise requirements should shape boundaries early without forcing enterprise complexity into the first pilot.

## Jobs to be done

### Guest

“When I know what I want, let me touch, choose, and order without waiting, downloading an app, or guessing whether the business received it.”

### Front-of-house

“When several service points need attention, route confirmed orders with the correct destination so I can focus on hospitality, delivery, and exceptions.”

### Kitchen or bar

“Show exactly what to prepare, where it belongs, and what changed.”

### Manager

“Let me publish the right menu to the right locations, control every physical access point, and see whether self-ordering improves service.”

## Positioning

### Category

NFC ordering for physical hospitality businesses.

### Spanish positioning statement

> Pedidos NFC para mesas, barras y mostradores, sin cambiar tu POS.

### Customer-facing headline

> Tus clientes piden. Tu equipo avanza.

### Supporting message

> Con un toque, SIRAY abre el menú correcto y lleva el pedido al equipo que lo prepara. Sin app, sin cuenta y sin reemplazar tu POS.

### What not to claim yet

- guaranteed sales growth;
- guaranteed labor savings;
- faster table turnover;
- fewer errors;
- compatibility with a named POS;
- payment integration;
- clone-proof standard NFC tags.

These remain measurable hypotheses or future capabilities.

## MVP scope

### Must work end to end

1. A manager creates one organization, location, menu, and service zone.
2. The manager creates products and modifiers manually or imports a reviewed CSV.
3. The manager publishes one menu and assigns it to the service zone.
4. SIRAY provisions an NFC plate with QR and short-link fallbacks for each service point.
5. A guest touches the plate and opens an opaque service-point URL.
6. The guest builds and submits an order without an account.
7. The server validates the access point, availability, prices, totals, and idempotency.
8. Staff explicitly accepts the order.
9. Kitchen or bar progresses it through preparation and ready states.
10. The guest sees status and the correct delivery or collection instruction.
11. Staff charges in the existing POS and confirms payment in SIRAY.

### Deliberate reductions

- One location and one active menu for the first pilot.
- Table service plus one shared pickup zone.
- Standard NDEF URL tags with a printed QR and short code.
- Manual payment confirmation.
- No customer account.
- No generic POS framework, wallet, loyalty, inventory, invoicing, delivery marketplace, or reservations.
- No automated PDF/image publishing without human review.
- No enterprise SSO or cross-region architecture before a contracted requirement.

## NFC kit and lifecycle

The pilot kit includes:

- physical plates or stickers appropriate to the venue surface;
- one NDEF HTTPS URL per service point;
- visible table or zone label;
- printed QR and short-code fallback;
- provisioning and installation record;
- replacement and retirement process;
- scan/tap diagnostics.

Standard tags can be copied. The pilot mitigates abuse through opaque rotatable tokens, staff acceptance, rate limits, location controls, and visible installation checks. Higher-risk deployments may use cryptographic tags with dynamic URL parameters, but they add cost and provisioning complexity and should be justified by the threat model.

## Product rules

- NFC is primary, but ordering remains recoverable through QR, short link, and staff entry.
- Physical access credentials never contain database IDs, prices, or sensitive business data.
- Menus are assigned to locations or zones, not duplicated per service point.
- A submitted order is not automatically a kitchen commitment; acceptance is explicit.
- The server never trusts client prices or totals.
- Product and modifier names and prices are snapshotted into order items.
- Repeated submits use an idempotency key.
- Staff can pause ordering by location, zone, point, menu, category, or product.
- Every operational exception has a visible recovery path.
- Hardware replacement rotates credentials without rebuilding the menu or service point.

## Pilot offer

Offer a managed operational pilot rather than a broad SaaS plan:

- one location;
- one menu and one service zone;
- 5–15 provisioned NFC plates with printed fallbacks;
- menu setup or CSV import included;
- staff and kitchen onboarding;
- one-week baseline and two-week pilot;
- weekly workflow and hardware review.

The commercial question is: “What is the value of turning each physical service point into a reliable ordering point without replacing the existing POS?”

## Metrics

### North-star learning metric

Accepted self-orders per eligible service point during peak periods.

### Funnel

`eligible point → NFC/QR open → menu loaded → item added → order submitted → accepted → fulfilled → payment confirmed`

### Access metrics

- NFC opens versus QR, short-link, and staff-assisted opens;
- tap-to-menu-load time;
- failed or repeated opens by physical asset;
- inactive, damaged, moved, or replaced tags;
- guests who require instructions before opening.

### Operational guardrails

- cancellation, duplicate, and rejection rate;
- unavailable-item rate;
- order mismatch rate;
- time to acceptance and fulfillment;
- manual POS re-entry time;
- kitchen notification failures;
- customer assistance requests.

## Decision gates

### Continue

Continue when guests use NFC without repeated explanation, the fallback rate is understood, managers observe net operational value, and error rates do not worsen.

### Adjust

Adjust the physical cue, service mode, approval flow, or menu setup path when adoption or operations fail at a specific step. Do not treat every problem as a software feature request.

### Expand

Add multi-location publishing, hardware fleet controls, and one proven integration only after a pilot establishes repeatable demand.

### Stop or reposition

Stop or reposition when the venue's hospitality model conflicts with self-ordering, NFC requires constant staff explanation, or duplicate system entry costs more time than order capture saves.
