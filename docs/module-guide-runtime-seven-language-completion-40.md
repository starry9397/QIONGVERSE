# Module Guide: Runtime Seven-Language Completion

## Scope

- Product: HAINAN∞QIONGVERSE is an English-first Hainan Province digital exhibition. It remains a cultural orientation layer, not a government, policy, booking, payment, or commercial-guarantee service.
- User task: select any supported language and read Travel Atlas, the demo Market, the source desk, and all six immersive halls without project-controlled English or Chinese fallback copy.
- Routes: `#travel-atlas`, `#market` and its child hashes, the source desk, `#tropical-hall`, `#limiao-hall`, `#aerospace-hall`, `#huali-hall`, `#village-hall`, and `#free-trade-hall`.
- Languages: `en`, `zh`, `id`, `ja`, `ko`, `ru`, `ar`. English is default; Arabic must retain root RTL behavior.

## Content, source, and AI boundary

- Translate project-authored titles, summaries, labels, states, actions, descriptions, limitations, image alt text, ARIA labels, and empty/error notices with semantic equivalence.
- Preserve brand names, source publishers, external official titles, canonical URLs, filenames, and text embedded in supplied media as original labels. These are explicitly permitted original labels, not fallbacks.
- Do not add facts about access, policy, travel, culture, prices, stock, services, current operations, or commercial availability. Existing source scope and AIGC/ShellSong/demo labels must remain clear in every language.
- `LocalizedText` for runtime content must include all seven languages. New two-field `{ en, zh }` objects are invalid outside legacy metadata that does not reach a visitor surface.

## Implementation boundary

- Reuse `src/i18n.ts`, shared `tx`, data models, and existing route components. Do not make seven independent page copies.
- Audit Travel Atlas, TradePage/commerce data, source desk data and components, six immersive components, and their exhibit data modules.
- Add a deterministic repository checker to validate required locale keys and block runtime `en/zh`-only object literals or legacy binary language branching in scoped sources.
- The checker may allow explicit `OriginalLabel`/official-source metadata and source URLs, but no silent English fallback in project-controlled visitor copy.

## Safety, privacy, and accessibility

- Do not add APIs, browser storage, keys, tracking, camera, microphone, location, payment, CRM, or data collection.
- Maintain source link security, focus visibility, keyboard behavior, reduced motion, media fallback, responsive text wrapping, and 320px through 1440px layouts.
- Arabic mirrors text/control layout but does not reverse maps, visual media, models, numbers, logos, canonical URLs, or external-source names.

## Verification gate

- The locale checker validates all scoped runtime files and the source/commerce/travel data that reaches them.
- The server self-test continues to check seven locales and source boundaries.
- Run `npm run check:i18n`, `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
- Inspect Arabic plus Japanese, Korean, Russian, and Indonesian text on each affected route; no horizontal overflow, untranslated project labels, or generic English fallback may remain.
