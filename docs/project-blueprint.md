# HAINAN∞QIONGVERSE 琼境: Project Blueprint

## Positioning

**HAINAN∞QIONGVERSE 琼境** is a living gateway to Hainan Province where tropical culture, AI creativity, and cross-border opportunity meet. English is the primary visitor language and Chinese mirrors all project-authored content.

The product is a provincial cultural-tourism exhibition and a careful orientation layer for public Free Trade Port information. It is not a government website, policy adviser, travel-booking engine, product catalog, or commercial guarantee. Dongfang is a local context for the Rosewood hall, not the sole subject of the platform.

## Public Experience

| Surface | MVP route | Purpose |
| --- | --- | --- |
| Brand entry | `#top` | Project visual, Free Trade Port entry, and Luoyin access |
| Five-hall gateway | `#exhibition` | Full-screen visual wheel entering one of five cultural halls |
| Tropical Island | `#tropical-hall` | Project-curated coast and ecology visual orientation |
| Li & Miao Heritage | `#limiao-hall` | Heritage-focused visual and exhibit reading |
| Wenchang Aerospace | `#aerospace-hall` | Project-curated aerospace visual orientation |
| Dongfang Rosewood | `#huali-hall` | Grain, carving, and AIGC concept-object reading |
| Beautiful Villages | `#village-hall` | Rural landscape and lived-environment visual orientation |
| Free Trade Port | `#free-trade-hall` | Public-information orientation with official-source doorway |

Hash routes are the production MVP because they support direct static hosting without server rewrite rules. Semantic path routes remain a later deployment task, not a duplicate client routing system.

## Reality And AI Rules

- `verified_primary_source` supports only the record's stated scope and review date.
- `supplied_project_media` provides curatorial visual context only, never external fact proof.
- `shellsong_fiction` is original fictional Luoyin guide material and is always labeled as fiction.
- `AIGC concept exhibit` is never a real relic, material authentication, product offer, price, inventory, or official media.
- Current policy, travel, visa, customs, tax, investment, availability, and eligibility questions must point to a primary source or human confirmation. They may not be inferred by AI.

## Product Sequence

1. A visitor chooses a cultural hall or the Free Trade Port orientation.
2. The matching SPZ world, static fallback, exhibit reading layer, and optional Luoyin avatar load only after the route opens.
3. Luoyin returns bilingual, source-classified guidance.
4. A visitor may request a local MVP handoff receipt. It is not an order, booking, official service, or promise of human reply.

## Technical Boundaries

- React, Vite, TypeScript, Spark/Three.js, and the existing Node HTTP service remain the MVP stack.
- `/api/luoyin` remains backward compatible. `/api/luoyin/chat` is the normalized API contract for future clients.
- `GLM_API_KEY` is process-only and must be supplied through deployment secrets.
- No browser secret, camera, MediaPipe, client storage for dialogue/location, remote source scraping, tracking SDK, CRM, payment, or user account is introduced without a separate approved module.

## Delivery Order

1. Province governance, asset evidence, source governance, and API safety.
2. Six-hall presentation quality and reviewed provincial reading content.
3. Source-grounded Luoyin contract and error handling.
4. Consent-first human handoff after a data controller and retention policy are approved.
5. Competition evidence, SEO/share assets, and the five-minute presentation flow.

## Module Gate

Before implementation, every module needs a detailed guide covering Hainan Province scope, user task, routes, assets, source status, AIGC labels, privacy/security, failure fallback, bilingual copy, accessibility, responsive checks, and verification commands.
