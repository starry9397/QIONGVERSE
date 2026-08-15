# Module Guide: Integrated Experiences

## Purpose

Integrate the existing ShellSong, Hainan Unfolded and project-demo Market experiences into HAINAN∞QIONGVERSE without changing the homepage hero, five-hall wheel, Free Trade Port hall, six immersive halls, existing Luoyin drawer, or their routes. The subject remains Hainan Province. English leads and Chinese mirrors all project-authored copy.

## Routes And Reuse

- Add lazy Hash surfaces: `#luoyin-tide`, `#travel-atlas`, and `#market` plus the documented market detail routes.
- Reuse root language state, `BrandLockup`, `apiPath`, the existing guide drawer, all six hall open functions, and `#top` as the return target.
- Desktop navigation exposes ShellSong, Travel and Market directly. Narrow layouts move those destinations into an accessible compact explorer menu.
- The homepage may add only a three-destination gateway after the existing exhibition wheel and before the footer; it cannot reorder, replace, or make factual claims beyond the existing site.

## Content, Source And Privacy Boundaries

- ShellSong is original `shellsong_fiction`; retain its visible fiction label and never present it as a historical or official source.
- Travel may use reviewed source records and project visual context. Its compiler may order only local allowlisted stop IDs and must never offer real-time routing, booking, availability, eligibility, or policy advice.
- Market remains a session-only project demo. Prices, stock, cart, checkout, receipt, delivery and services are interface demonstrations, not a product offer, payment flow, merchant catalogue, fulfilment, order, quote, or partnership.
- No browser secret, GLM key, payment integration, CRM, email, analytics SDK, camera call, identity record, location collection, `localStorage`, or `sessionStorage` is permitted.
- `/api/travel-atlas/plan` accepts only `days`, `themes`, `pace`, and `language`; it stores nothing and rejects extra fields.

## Assets And Failure Behaviour

- Import only assets actually referenced by each UI. Exclude unused ShellSong GLB, gesture runtime and video assets. Keep travel film route-lazy with a poster fallback.
- Every image has meaningful alt text or deliberate decorative empty alt. Video failure retains the poster and the rest of the travel experience.
- All imported source facts must remain source-labelled; source registry edits merge with, rather than overwrite, current working-tree changes.

## Interaction And Accessibility

- Route changes retain browser history and move focus to the route main heading without forcing a scroll for internal product routes.
- All menus, controls, sharing fallbacks, keyboard focus, Enter/Space activation, image failure states and reduced-motion behavior remain usable.
- Test 320px, 375px, 768px, 1115px and desktop widths for no page-level horizontal overflow.

## Verification

Run `npm run build`, `npm run test:server`, `node --check server.mjs`, `git diff --check`, route checks, resource loading checks and a scan for secrets/client persistence before handoff.

## Recorded Deliberation

The authoritative blueprint lists the current site as an exhibition and orientation layer rather than an ecommerce or booking service. This integration deliberately preserves the standalone Market as an explicitly labelled session-only project demonstration and Travel as a source-bounded cultural route compiler; neither gains a real commercial or booking capability.
