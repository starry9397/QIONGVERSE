# Module Guide: Seven-Language Completion

## Scope and user task

Complete project-authored visitor copy for HAINAN∞QIONGVERSE across English, Simplified Chinese, Bahasa Indonesia, Japanese, Korean, Russian, and Arabic. English remains the first-visit default. A user-selected locale remains the only persistent browser preference (`qiongverse.language`).

## Routes and surfaces

This work covers `#top`, `#hainan-map`, all five cultural halls, `#free-trade-hall`, `#luoyin-tide`, `#travel-atlas`, all `#market` child routes, source desk, local handoff forms, social sharing, and the Luoyin desktop pet. Existing Hash routing, hall state, cart state, and dialog state must remain intact while the language changes.

## Content and evidence boundary

Translate project-owned headings, descriptions, controls, validation states, source explanations, and local fallback messages. Do not translate the supplied map image, logo artwork, brand names, filenames, official organisation names, or formal external source titles. Translation must not create travel availability, policy, tax, visa, investment, product, inventory, price, official-service, or commercial claims.

## Accessibility and responsive requirements

Every visible action, title, placeholder, status message, accessible name, and fallback is locale-aware. Arabic sets `lang="ar"` and `dir="rtl"`; maps, media, logos, geographic coordinates, and 3D controls remain visually unmirrored. Check long Indonesian and Russian text at 320px, 375px, 768px, 1115px, and 1440px. Respect reduced motion and existing visible focus styles.

## Privacy and service boundary

No translation service, tracking SDK, camera, geolocation, personal data collection, new endpoint, or browser storage is introduced. Server locales remain allowlisted. Local guide, travel, social, handoff, and error responses must not leak keys, internal paths, prompts, or OAuth state.

## Implementation and acceptance

Use the shared i18n layer for all project-controlled text. No component may choose English simply because the locale is not Chinese. Missing project content must resolve through the locale-aware translation catalog rather than English. Preserve original external labels explicitly. Run `npm run build`, `npm run test:server`, `node --check server.mjs`, `git diff --check`, locale-source scans, and browser checks after changes.
