# Peru market discovery

Last updated: 2026-08-24

## Executive conclusion

SIRAY is entering a crowded category. QR menus, table ordering, kitchen displays, POS software, and SUNAT invoicing are already bundled by multiple vendors in Peru. The product decision is to lead with NFC as the primary physical interaction and include the installed access kit as part of the offer.

NFC can differentiate the first interaction, but the business will not be defensible through a commodity tag alone. SIRAY must test whether a managed combination of NFC provisioning, menu setup, service-point context, reliable order routing, and hardware support creates measurable value without damaging hospitality or forcing a POS migration.

This is desk research, not customer validation. It supports where to look; it does not prove that a restaurant will adopt or pay for SIRAY.

## What the evidence supports

### The restaurant market is active

INEI reported that restaurant activity increased 4.44% in November 2025. This indicates an active market, but does not establish demand for self-ordering software.

Source: [INEI, Monthly Services Survey — November 2025](https://www1.inei.gob.pe/media/MenuRecursivo/boletines/boletin-sector-servicios-noviembre-2025.pdf)

### Peru is ready for low-value digital interactions

BCRP research reports that digital payments per adult increased from 29 in 2015 to 442 in 2024. A separate BCRP study identifies instant transfers, QR payments, lower fees, and POS interoperability as important drivers of wallet adoption. This supports familiarity with low-value digital interactions, not necessarily willingness to self-order through NFC.

Sources:

- [BCRP, Competition and interoperability in Peru's digital payment ecosystem](https://www.bcrp.gob.pe/docs/Publicaciones/Documentos-de-Trabajo/2025/documento-de-trabajo-003-2025.pdf)
- [BCRP, Adoption and welfare effects of payment innovations in Peru](https://investigacion.bcrp.gob.pe/es/investigaciones/documentos-de-trabajo/dt-2025/dt-2025-006)

### Process automation is a recognized MYPE objective

PRODUCE's Mype Digital program explicitly promotes digital tools that automate internal processes and save time and money. This validates the broader digitalization direction, but it is not evidence that table ordering is the highest-priority process.

Source: [PRODUCE, Mype Digital](https://www.gob.pe/mype-digital)

### QR satisfaction depends on experience quality

A 2025 hospitality study found that information quality, usability, and interactive quality affect satisfaction with restaurant digital menus. SIRAY cannot win by placing a PDF behind a QR code; menu performance and clarity are part of the operational product.

Source: [International Journal of Hospitality Management, “From paper to pixels”](https://www.sciencedirect.com/science/article/pii/S0278431925004487)

### App-free NFC access is technically feasible

Apple documents background reading of NDEF URI records on iPhone XS and later. When no associated app is installed, an HTTPS link opens in Safari. Android recommends NDEF for broad tag compatibility and maps URI records to web intents; Android 17 will require an explicit tap on an “open link” notification. SIRAY should therefore encode a normal HTTPS URL, not depend on browser Web NFC APIs or a native application.

Standard tags do not prove that the device is physically present at an approved service point. NXP's Secure Dynamic Messaging hardware can produce a unique secure response per tap, but adds provisioning and verification complexity. The pilot should use standard tags with operational controls and keep secure tags as a higher-risk tier.

Sources:

- [Apple, Adding Support for Background Tag Reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading)
- [Android Developers, NFC basics](https://developer.android.com/develop/connectivity/nfc/nfc)
- [NXP, NTAG 424 DNA features and hints](https://www.nxp.com/docs/en/application-note/AN12196.pdf)

## Competitive scan

The following are vendor claims, not independently verified performance data.

| Vendor | Publicly advertised scope | Implication for SIRAY |
| --- | --- | --- |
| [Qway POS](https://www.qway.pe/) | POS, SUNAT, QR table orders, kitchen, inventory, delivery integrations | QR-to-kitchen is already a feature inside local POS suites. |
| [Komanda](https://komanda.pe/) | POS, SUNAT, inventory, QR menu, WhatsApp ordering | A free QR menu can be an acquisition feature, which pressures standalone menu pricing. |
| [Toteat Peru](https://toteat.com/es-pe/productos/menu-qr-integrado) | POS, tables, QR ordering, kitchen, payments, pickup, delivery, and multi-location plans | Its integrated QR flow already routes orders to kitchen; NFC alone must not leave SIRAY with a weaker operational flow. |
| [PANCA](https://www.panca.pe/) | POS, QR menu, kitchen, inventory, cash register, invoicing | “All in one” is the default category narrative; copying it would erase SIRAY's focus. |
| [ComandaPE](https://www.comandape.com/) | Digital orders, table map, kitchen display, and SUNAT invoicing from S/99/month | Price pressure is real for small venues; SIRAY's managed NFC setup must remove work, not sell another generic dashboard. |
| [Mesakloud](https://mesakloud.com/) | Vendor-managed setup for menu, tables, users, locations, QR ordering, delivery, and WhatsApp | Setup service is already a competitive expectation, supporting a managed onboarding offer. |

## Unvalidated hypotheses

1. Peak-hour order capture is painful enough for an owner or manager to change the service flow.
2. At least one useful restaurant segment prefers optional self-ordering without removing human service.
3. Customers will touch an NFC plate and place an order without staff prompting after seeing a clear physical cue.
4. A required kitchen/staff acceptance step prevents fraudulent, duplicate, or mistaken orders without reintroducing the original bottleneck.
5. Manual POS re-entry after preparation is tolerable in the pilot and takes less staff time than manual order capture.
6. The economic buyer values throughput, fewer order-capture errors, or redeployed staff time enough to pay a monthly fee.

## Highest-risk operational questions

- Who accepts the order: front-of-house, bar, or kitchen?
- What happens when an item sells out after the menu was opened?
- How does staff detect a copied URL, photographed fallback QR, moved plate, or cloned standard NFC tag?
- Which physical instruction produces a successful first tap across common iPhone and Android models?
- What share of guests uses QR or a short link instead of NFC, and why?
- Are guests comfortable ordering separately at the same table?
- Which service modes require a shared queue, guest name, order number, or table session?
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
- Test the physical NFC cue on at least 6 common iPhone and Android models with locked/unlocked, camera-open, and NFC-disabled conditions.
- Test one table point and one shared bar/counter point so the data model is not validated only against tables.
- Record existing POS names, when an order must be entered, and who owns each state transition.

### Two-week pilot

Start with one location, one published menu, one table zone, one shared pickup zone, and 5–15 NFC plates. Every plate includes a QR and short-link fallback that resolves the same service point.

Collect a one-week baseline, then measure:

- eligible service points and occupied tables;
- NFC, QR, short-link, and staff-assisted opens per eligible point;
- successful first-tap rate and tap-to-menu-load time;
- self-orders submitted without staff prompting;
- median time from scan to submit;
- median time from submit to acceptance;
- median time from acceptance to ready;
- cancellation, duplicate, misrouted, and item-error rates;
- staff time spent capturing and re-entering orders;
- customer requests for human assistance;
- damaged, moved, inactive, or replaced NFC assets;
- staff and customer qualitative feedback.

Preliminary learning targets, to be recalibrated against the pilot partner's baseline:

- at least 35% of eligible service points produce a self-order without a staff prompt by the end of week two;
- at least 80% of observed supported-device NFC attempts open the menu on the first or second tap;
- median acceptance time below 60 seconds during peak periods;
- no increase in order errors or cancellations versus baseline;
- a net reduction in staff order-capture time after including POS re-entry;
- explicit willingness from the manager to keep the system active after the pilot.

## Research decision

Proceed with an NFC-first controlled pilot. Build only the hardware operations needed to provision, install, verify, rotate, and replace pilot tags. Keep QR and short links as required recovery paths. Do not build payment integrations, loyalty, inventory, a broad POS framework, or cryptographic tag infrastructure until the pilot produces evidence of adoption, operational improvement, and a real abuse threat.
