# Peru market discovery

Last updated: 2026-08-23

## Executive conclusion

SIRAY is entering a crowded category. QR menus, table ordering, kitchen displays, POS software, and SUNAT invoicing are already bundled by multiple vendors in Peru. NFC is therefore an entry mechanism, not a defensible product advantage.

The strongest initial problem is narrower: during peak periods, customers who already know what they want still wait for staff to capture and relay an order. SIRAY should test whether removing that relay creates measurable value without damaging hospitality or forcing a POS migration.

This is desk research, not customer validation. It supports where to look; it does not prove that a restaurant will adopt or pay for SIRAY.

## What the evidence supports

### The restaurant market is active

INEI reported that restaurant activity increased 4.44% in November 2025. This indicates an active market, but does not establish demand for self-ordering software.

Source: [INEI, Monthly Services Survey — November 2025](https://www1.inei.gob.pe/media/MenuRecursivo/boletines/boletin-sector-servicios-noviembre-2025.pdf)

### Peru is ready for low-value digital interactions

BCRP research reports that digital payments per adult increased from 29 in 2015 to 442 in 2024. A separate BCRP study identifies instant transfers, QR payments, lower fees, and POS interoperability as important drivers of wallet adoption. This supports familiarity with QR-led payment behavior, not necessarily willingness to self-order at a table.

Sources:

- [BCRP, Competition and interoperability in Peru's digital payment ecosystem](https://www.bcrp.gob.pe/docs/Publicaciones/Documentos-de-Trabajo/2025/documento-de-trabajo-003-2025.pdf)
- [BCRP, Adoption and welfare effects of payment innovations in Peru](https://investigacion.bcrp.gob.pe/es/investigaciones/documentos-de-trabajo/dt-2025/dt-2025-006)

### Process automation is a recognized MYPE objective

PRODUCE's Mype Digital program explicitly promotes digital tools that automate internal processes and save time and money. This validates the broader digitalization direction, but it is not evidence that table ordering is the highest-priority process.

Source: [PRODUCE, Mype Digital](https://www.gob.pe/mype-digital)

### QR satisfaction depends on experience quality

A 2025 hospitality study found that information quality, usability, and interactive quality affect satisfaction with restaurant digital menus. SIRAY cannot win by placing a PDF behind a QR code; menu performance and clarity are part of the operational product.

Source: [International Journal of Hospitality Management, “From paper to pixels”](https://www.sciencedirect.com/science/article/pii/S0278431925004487)

## Competitive scan

The following are vendor claims, not independently verified performance data.

| Vendor | Publicly advertised scope | Implication for SIRAY |
| --- | --- | --- |
| [Qway POS](https://www.qway.pe/) | POS, SUNAT, QR table orders, kitchen, inventory, delivery integrations | QR-to-kitchen is already a feature inside local POS suites. |
| [Komanda](https://komanda.pe/) | POS, SUNAT, inventory, QR menu, WhatsApp ordering | A free QR menu can be an acquisition feature, which pressures standalone menu pricing. |
| [Toteat Peru](https://toteat.com/es-pe) | POS, tables, inventory, QR table ordering, delivery, pickup | Full-suite vendors can cross-sell self-ordering to installed customers. |
| [PANCA](https://www.panca.pe/) | POS, QR menu, kitchen, inventory, cash register, invoicing | “All in one” is the default category narrative; copying it would erase SIRAY's focus. |
| [Qway/other local POS category](https://www.qway.pe/) | Direct-to-kitchen and fewer duplicate entries | SIRAY must prove it can coexist with a POS without creating a worse duplicate-entry burden. |

## Unvalidated hypotheses

1. Peak-hour order capture is painful enough for an owner or manager to change the service flow.
2. At least one useful restaurant segment prefers optional self-ordering without removing human service.
3. Customers will place a table order without staff prompting after seeing a clear physical cue.
4. A required kitchen/staff acceptance step prevents fraudulent, duplicate, or mistaken orders without reintroducing the original bottleneck.
5. Manual POS re-entry after preparation is tolerable in the pilot and takes less staff time than manual order capture.
6. The economic buyer values throughput, fewer order-capture errors, or redeployed staff time enough to pay a monthly fee.

## Highest-risk operational questions

- Who accepts the order: front-of-house, bar, or kitchen?
- What happens when an item sells out after the menu was opened?
- How does staff detect a customer ordering from an old photo of a table QR code?
- Are guests comfortable ordering separately at the same table?
- How does the team combine digital and waiter-entered items when charging the table?
- Does the existing POS require orders to be entered before preparation for tax, inventory, or kitchen workflow reasons?
- What happens during weak connectivity or when the kitchen screen is unattended?
- Does self-ordering reduce hospitality in the target venue?

## Validation plan

### Discovery before backend integration

- Interview 5 owners or managers across cafés, fast casual venues, and casual table-service restaurants.
- Interview 8 front-of-house and kitchen staff members.
- Observe 3 peak service periods and time the current order path from customer readiness to kitchen receipt.
- Run 12 customer usability sessions using `/t/demo`, including at least 4 group-table scenarios.
- Record existing POS names, when an order must be entered, and who owns each state transition.

### Two-week pilot

Start with one location, one menu, one service zone, and QR identifiers. NFC can be added after the flow works.

Collect a one-week baseline, then measure:

- eligible occupied tables;
- menu opens per eligible table;
- self-orders submitted without staff prompting;
- median time from scan to submit;
- median time from submit to acceptance;
- median time from acceptance to ready;
- cancellation, duplicate, misrouted, and item-error rates;
- staff time spent capturing and re-entering orders;
- customer requests for human assistance;
- staff and customer qualitative feedback.

Preliminary learning targets, to be recalibrated against the pilot partner's baseline:

- at least 35% of eligible tables self-order without a staff prompt by the end of week two;
- median acceptance time below 60 seconds during peak periods;
- no increase in order errors or cancellations versus baseline;
- a net reduction in staff order-capture time after including POS re-entry;
- explicit willingness from the manager to keep the system active after the pilot.

## Research decision

Proceed with a QR-first prototype and a controlled pilot. Do not build payment integrations, loyalty, inventory, or NFC hardware operations until the table-to-kitchen flow produces evidence of adoption and operational improvement.
