# SIRAY product strategy

Last updated: 2026-08-23

## Product thesis

SIRAY turns a physical table into an operational ordering point.

The product is not the NFC tag or QR code. The product is the reliable movement of an order from customer intent to staff acceptance, kitchen preparation, delivery, and payment confirmation.

## Critical assessment of the original concept

### Highest real value

Removing the manual order-capture relay at peak times while keeping the restaurant in control.

### Useful but not differentiated

- a mobile menu;
- table-specific QR codes;
- live order status;
- a kitchen display;
- manual payment confirmation.

These are required parts of the workflow, but local and regional vendors already advertise them.

### Mostly “cool” before validation

- NFC hardware as the lead message;
- loyalty, wallet passes, and customer profiles;
- AI analytics;
- broad payment-provider abstractions;
- complex multi-location administration;
- visual analytics dashboards.

### What could make the MVP fail

1. Customers prefer a waiter in the target venue.
2. Staff acceptance becomes a new bottleneck.
3. The existing POS requires duplicate entry before kitchen preparation.
4. Old or shared table links create unauthorized orders.
5. A stale menu causes unavailable-item cancellations.
6. Kitchen connectivity or sound notifications are unreliable.
7. The buyer perceives SIRAY as a small feature already included in their POS.

## Refined beachhead

### Ideal initial customer

A single-location or small-chain café / fast-casual restaurant in Lima with:

- pronounced peak periods;
- table or hybrid table/counter service;
- repeat rounds or add-on orders;
- modifier-heavy products;
- customers comfortable using mobile web;
- an existing POS the business does not want to replace;
- a manager willing to measure the current workflow.

### Poor initial fit

- fine dining where personal service is the central experience;
- venues with low order-capture pressure;
- businesses primarily seeking invoicing, inventory, or accounting;
- venues that cannot operate unless every item is first entered into the current POS;
- buyers demanding a complete POS replacement.

## Jobs to be done

### Customer

“When I know what I want, let me order without waiting or downloading anything, and show me that the restaurant received it.”

### Front-of-house

“When several tables need attention, let confirmed orders arrive with table and modifier context so I can focus on exceptions, delivery, and hospitality.”

### Kitchen

“When an order arrives, show exactly what to prepare, for which table, and what changed.”

### Manager

“When service gets busy, show where orders are waiting and whether self-ordering actually improves speed without increasing mistakes.”

## Positioning

### Category

Digital ordering for physical businesses.

### Spanish positioning statement

> Pedidos desde mesa que llegan a cocina, sin cambiar tu POS.

### Customer-facing headline

> Tus clientes piden. Tu equipo avanza.

### Supporting message

> SIRAY lleva el pedido desde la mesa hasta cocina, sin instalar una app, crear una cuenta ni reemplazar el POS que ya usas.

### What not to claim yet

- guaranteed sales growth;
- guaranteed labor savings;
- faster table turnover;
- fewer errors;
- compatibility with a named POS;
- payment integration.

These are hypotheses to measure, not marketing claims.

## MVP scope

### Must work end to end

1. Manager creates one business, one location, and tables.
2. Manager publishes categories, products, modifier groups, prices, and availability.
3. A guest opens an opaque table URL from a QR code.
4. The guest builds and submits an order without an account.
5. The server validates table, availability, prices, totals, and idempotency.
6. Staff or kitchen receives and explicitly accepts the order.
7. Kitchen progresses the order through preparing and ready.
8. The guest sees order status.
9. Staff delivers the order.
10. Staff charges in the existing POS and marks payment as paid in SIRAY.
11. The table session closes after all orders are delivered/cancelled and paid.

### Important reductions

- QR first. NFC resolves to the same token later.
- One pilot location before full multi-location administration.
- Manual payment only.
- No POS integration in the first pilot.
- No customer account.
- No split bill, loyalty, promotions, receipts, WhatsApp, delivery, reservations, inventory, or invoicing.
- No generic payment-provider interface until a second real provider is selected. Preserve provider fields and events in the data model instead.
- No analytics dashboard; capture essential events and analyze them directly.

## Product rules

- Order creation and payment are separate state machines.
- A submitted order is not automatically a kitchen commitment; acceptance is explicit.
- The server never trusts client prices or totals.
- Product and modifier names/prices are snapshotted into order items.
- Repeated submits use an idempotency key.
- Guests access only their active table session.
- Staff can always pause digital ordering for a location, table, category, or product.
- Every operational exception has a visible recovery path.

## Pilot offer

Avoid selling a broad SaaS plan before the value is measured.

Offer a managed pilot:

- one location;
- one service zone;
- menu setup included;
- QR table cards;
- staff and kitchen onboarding;
- baseline and pilot measurement;
- weekly workflow review.

The commercial question is not “How much is a QR menu?” It is “What is the value of removing peak-hour order capture without a POS migration?”

## Metrics

### North-star learning metric

Accepted self-orders per eligible occupied table during peak periods.

### Funnel

`table eligible → menu opened → item added → order submitted → order accepted → order delivered → payment confirmed`

### Guardrails

- cancellation and duplicate rate;
- unavailable-item rate;
- staff rejection rate;
- customer assistance requests;
- order mismatch rate;
- time to acceptance;
- manual POS re-entry time;
- kitchen notification failures.

## Decision gates

### Continue

Continue when customers self-order without repeated prompting, managers observe net operational value, and error rates do not worsen.

### Adjust

Adjust the workflow if adoption is strong but acceptance or POS re-entry creates delay. The likely next step is a narrower staff approval view or one prioritized POS integration.

### Stop or reposition

Stop or reposition if adoption requires constant staff explanation, the venue's hospitality model conflicts with self-ordering, or duplicate POS entry costs more time than order capture saves.
